export interface User {
  id?: number
  email: string
  [key: string]: any
}

export interface Post {
  id: number
  title: string
  content: string
  owner?: User
  owner_id?: number
  created_at?: string
  votes?: number
  [key: string]: any
}

export type PostOut = Post

export interface Token {
  access_token: string
  token_type?: string
}
