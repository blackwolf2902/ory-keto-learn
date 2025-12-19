export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
export interface KratosIdentity {
    id: string;
    traits: {
        email: string;
        name?: string;
    };
    created_at?: string;
    updated_at?: string;
}
