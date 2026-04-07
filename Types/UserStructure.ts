export type User = {
    _id: string,
    name: string,
    password: string | null | undefined,
    access_level: string,
    email: string,
    company: string
    created_at: string,
}