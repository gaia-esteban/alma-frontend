import { api, TagTypes } from './baseApi';
import { AdminUser } from '@/types/adminUser';

export interface UsersResponse {
  data: AdminUser[];
  total: number;
}

export interface UserSingleResponse {
  success: boolean;
  message: string;
  data: { user: AdminUser };
}

export interface UsersQueryParams {
  role?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface UserCreateBody {
  name: string;
  email: string;
  role?: 'user' | 'admin';
  company_access: string[];
}

export interface UserUpdateBody {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  active?: boolean;
  status?: string;
  company_access?: string[];
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UsersQueryParams>({
      query: (params = {}) => ({
        url: '/users',
        method: 'GET',
        params,
      }),
      providesTags: [TagTypes.User],
    }),

    createUser: builder.mutation<UserSingleResponse, UserCreateBody>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [TagTypes.User],
    }),

    updateUser: builder.mutation<UserSingleResponse, { id: number; data: UserUpdateBody }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: TagTypes.User, id },
        TagTypes.User,
      ],
    }),

    deleteUser: builder.mutation<{ success: boolean; message: string }, { id: number }>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [TagTypes.User],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
