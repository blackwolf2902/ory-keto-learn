import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  Configuration,
  PermissionApi,
  RelationshipApi,
  Relationship,
} from '@ory/keto-client';

/**
 * ============================================
 * KETO SERVICE - Core Authorization Logic
 * ============================================
 *
 * This service handles all interactions with Ory Keto.
 * It's the heart of our authorization system.
 *
 * KEY CONCEPTS:
 *
 * 1. RELATION TUPLES: The data stored in Keto
 *    Format: namespace:object#relation@subject  Shop:product#viewer@User:customer123  Shop:product#viewer@Group:customers Shop:product#owner@User:shopkeeper123
 *    Example: Document:readme.md#viewer@User:alice
 *
 * 2. CHECK API: "Does subject have permission on object?"
 *    → Returns boolean
 *
 * 3. EXPAND API: "Who has this permission on this object?"
 *    → Returns subject tree
 *
 * 4. RELATIONSHIP API: Create/delete relation tuples
 *    → Manages the permission data
 */
@Injectable()
export class KetoService implements OnModuleInit {
  private readonly logger = new Logger(KetoService.name);

  private permissionApi: PermissionApi;
  private relationshipApi: RelationshipApi;

  constructor() {
    // Read API for permission checks
    const readConfig = new Configuration({
      basePath: process.env.KETO_READ_URL || 'http://localhost:4466',
    });

    // Write API for relation management
    const writeConfig = new Configuration({
      basePath: process.env.KETO_WRITE_URL || 'http://localhost:4467',
    });

    this.permissionApi = new PermissionApi(readConfig);
    this.relationshipApi = new RelationshipApi(writeConfig);
  }

  async onModuleInit() {
    this.logger.log('KetoService initialized');
    this.logger.log(`Read API: ${process.env.KETO_READ_URL || 'http://localhost:4466'}`);
    this.logger.log(`Write API: ${process.env.KETO_WRITE_URL || 'http://localhost:4467'}`);
  }

  // ============================================
  // RELATION TUPLE MANAGEMENT
  // ============================================

  /**
   * Create a relation tuple in Keto
   *
   * CONCEPT: Adding Permissions
   * When you create a document, you add:
   *   Document:doc-id#owner@User:user-id
   *
   * When you share with someone, you add:
   *   Document:doc-id#viewer@User:other-user-id
   *
   * @param namespace - Type of object (User, Group, Document, Folder)
   * @param object - Unique identifier of the object
   * @param relation - Type of relation (owner, editor, viewer, member)
   * @param subjectId - The user/group being granted access
   * @param subjectSet - Optional: reference to another relation (for groups)
   */
  async createRelation(params: {
    namespace: string;
    object: string;
    relation: string;
    subjectId?: string;
    subjectSet?: {
      namespace: string;
      object: string;
      relation: string;
    };
  }): Promise<void> {
    const { namespace, object, relation, subjectId, subjectSet } = params;

    const relationship: Relationship = {
      namespace,
      object,
      relation,
      subject_id: subjectId,
      subject_set: subjectSet,
    };

    try {
      await this.relationshipApi.createRelationship({ createRelationshipBody: relationship });
      this.logger.debug(
        `Created relation: ${namespace}:${object}#${relation}@${subjectId || `${subjectSet?.namespace}:${subjectSet?.object}#${subjectSet?.relation}`
        }`,
      );
    } catch (error: unknown) {
      this.logger.error(`Failed to create relation: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Delete a relation tuple from Keto
   *
   * CONCEPT: Revoking Permissions
   * To remove someone's access, delete their relation tuple.
   */
  async deleteRelation(params: {
    namespace: string;
    object: string;
    relation: string;
    subjectId?: string;
    subjectSet?: {
      namespace: string;
      object: string;
      relation: string;
    };
  }): Promise<void> {
    const { namespace, object, relation, subjectId, subjectSet } = params;

    try {
      await this.relationshipApi.deleteRelationships({
        namespace,
        object,
        relation,
        subjectId,
        subjectSetNamespace: subjectSet?.namespace,
        subjectSetObject: subjectSet?.object,
        subjectSetRelation: subjectSet?.relation,
      });
      this.logger.debug(
        `Deleted relation: ${namespace}:${object}#${relation}@${subjectId || `${subjectSet?.namespace}:${subjectSet?.object}#${subjectSet?.relation}`
        }`,
      );
    } catch (error: unknown) {
      this.logger.error(`Failed to delete relation: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Delete all relations for an object
   *
   * Useful when deleting a document/folder entirely.
   */
  async deleteAllRelationsForObject(namespace: string, object: string): Promise<void> {
    try {
      await this.relationshipApi.deleteRelationships({
        namespace,
        object,
      });
      this.logger.debug(`Deleted all relations for ${namespace}:${object}`);
    } catch (error: unknown) {
      this.logger.error(`Failed to delete relations: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  // ============================================
  // PERMISSION CHECKING
  // ============================================

  /**
   * Permission hierarchy for computed checks
   * owner > editor > viewer
   *
   * If you're an owner, you have all permissions.
   * If you're an editor, you have editor + viewer permissions.
   * If you're a viewer, you only have viewer permissions.
   */
  private readonly permissionHierarchy: Record<string, string[]> = {
    'view': ['viewer', 'editor', 'owner'],   // viewer, editor, or owner can view
    'edit': ['editor', 'owner'],              // editor or owner can edit
    'delete': ['owner'],                       // only owner can delete
    'share': ['owner'],                        // only owner can share
  };

  /**
   * Check if a subject has permission on an object
   *
   * CONCEPT: Authorization Check with Computed Permissions
   *
   * Since we're not using Keto's OPL (Ory Permission Language),
   * we implement the permission hierarchy in our service:
   *
   * - To 'view': check if user is viewer OR editor OR owner
   * - To 'edit': check if user is editor OR owner
   * - To 'delete': check if user is owner
   *
   * This simulates what OPL would do automatically.
   * In production with OPL, Keto handles this internally.
   *
   * @returns true if allowed, false if denied
   */
  async checkPermission(params: {
    namespace: string;
    object: string;
    relation: string;
    subjectId: string;
  }): Promise<boolean> {
    const { namespace, object, relation, subjectId } = params;

    // Get the relations that imply this permission
    const impliedRelations = this.permissionHierarchy[relation] || [relation];

    this.logger.debug(
      `Permission check: ${namespace}:${object}#${relation}@${subjectId} (checking: ${impliedRelations.join(', ')})`,
    );

    // Check each relation that could grant this permission
    for (const rel of impliedRelations) {
      try {
        const response = await this.permissionApi.checkPermission({
          namespace,
          object,
          relation: rel,
          subjectId,
        });

        if (response.data.allowed === true) {
          this.logger.debug(
            `Permission GRANTED via ${rel} relation`,
          );
          return true;
        }
      } catch (error: unknown) {
        // 403 means permission denied for this relation, continue checking
        if (!this.isAxiosError(error) || error.response?.status !== 403) {
          this.logger.error(`Permission check failed: ${JSON.stringify(error)}`);
          throw error;
        }
      }
    }

    this.logger.debug(`Permission DENIED: no matching relation found`);
    return false;
  }

  /**
   * Get all subjects with a specific permission on an object
   *
   * CONCEPT: Permission Expansion
   * "Who can view this document?" → Returns list of users/groups
   *
   * Useful for:
   * - Showing sharing status ("Shared with Alice, Bob, Engineering team")
   * - Auditing access
   */
  async expandPermission(params: {
    namespace: string;
    object: string;
    relation: string;
  }): Promise<string[]> {
    const { namespace, object, relation } = params;

    try {
      const response = await this.permissionApi.expandPermissions({
        namespace,
        object,
        relation,
      });

      // Parse the tree to extract subject IDs
      const subjects: string[] = [];
      this.extractSubjectsFromTree(response.data, subjects);

      return subjects;
    } catch (error: unknown) {
      this.logger.error(`Permission expansion failed: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Get all relationships for an object
   *
   * Useful for displaying current sharing state.
   */
  async getRelationships(params: {
    namespace: string;
    object: string;
  }): Promise<Relationship[]> {
    const { namespace, object } = params;

    try {
      const response = await this.relationshipApi.getRelationships({
        namespace,
        object,
      });

      return response.data.relation_tuples || [];
    } catch (error: unknown) {
      this.logger.error(`Failed to get relationships: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Helper to construct subject string for a user
   */
  userSubject(userId: string): string {
    return `User:${userId}`;
  }

  /**
   * Helper to construct subject set for group members
   *
   * CONCEPT: Subject Sets
   * Instead of granting access to each user, grant to "Group:engineers#member"
   * This means "anyone who is a member of engineers group"
   */
  groupMembersSubjectSet(groupId: string): {
    namespace: string;
    object: string;
    relation: string;
  } {
    return {
      namespace: 'Group',
      object: groupId,
      relation: 'member',
    };
  }

  private extractSubjectsFromTree(node: unknown, subjects: string[]): void {
    if (!node || typeof node !== 'object') return;

    const nodeObj = node as Record<string, unknown>;

    if (nodeObj.subject_id && typeof nodeObj.subject_id === 'string') {
      subjects.push(nodeObj.subject_id);
    }
    if (nodeObj.subject_set && typeof nodeObj.subject_set === 'object') {
      const subjectSet = nodeObj.subject_set as Record<string, unknown>;
      subjects.push(
        `${subjectSet.namespace}:${subjectSet.object}#${subjectSet.relation}`,
      );
    }
    if (nodeObj.children && Array.isArray(nodeObj.children)) {
      for (const child of nodeObj.children) {
        this.extractSubjectsFromTree(child, subjects);
      }
    }
  }

  private isAxiosError(error: unknown): error is { response?: { status?: number } } {
    return typeof error === 'object' && error !== null && 'response' in error;
  }
}
