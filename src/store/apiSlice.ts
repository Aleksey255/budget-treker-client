import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type Transaction = {
  _id: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  categoryName: string
  description: string
  date: string
}

export type Category = {
  _id: string
  name: string
}

export type ReportData = {
  _id: string
  incomeTotal: number
  expenseTotal: number
  balance: number
  income: Array<{ category: string; total: number }>
  expenses: Array<{ category: string; total: number }>
}

export type User = {
  _id: string
  email: string
  name: string
}

export type AuthResponse = {
  user: User
  token: string // JWT или другой токен
}

export type RegisterInput = {
  email: string
  password: string
  name: string
}

export type LoginInput = {
  email: string
  password: string
}

const baseUrl = import.meta.env.VITE_API_BASE_URL

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: headers => {
    const token = localStorage.getItem('token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Transactions', 'Categories', 'Reports', 'User'],
  endpoints: builder => ({
    // Транзакции
    getTransactions: builder.query<Transaction[], void>({
      query: () => '/transactions',
      providesTags: ['Transactions'],
    }),
    addTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: body => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Transactions', 'Reports'], // ← Инвалидируем отчёты!
    }),

    // 🗑 Удалить транзакцию
    deleteTransaction: builder.mutation<void, string>({
      query: id => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions', 'Reports'],
    }),

    // 🔄 Обновить транзакцию
    updateTransaction: builder.mutation<
      void,
      { id: string; body: Partial<Transaction> }
    >({
      query: ({ id, body }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Transactions', 'Reports'],
    }),

    // Категории
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
    addCategory: builder.mutation<Category, { name: string }>({
      query: body => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories', 'Transactions', 'Reports'], // может повлиять на фильтры
    }),
    deleteCategory: builder.mutation<void, string>({
      query: id => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', 'Transactions', 'Reports'],
    }),

    updateCategory: builder.mutation<void, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: ['Categories', 'Transactions', 'Reports'],
    }),

    // Отчёты
    getReports: builder.query<
      ReportData,
      { startDate?: string; endDate?: string }
    >({
      query: params => ({
        url: '/transactions/reports',
        params,
      }),
      providesTags: ['Reports'],
    }),
    // Получение текущего пользователя
    getMe: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      providesTags: ['User'],
      // Автоматически повторяет запрос при монтировании
    }),
    register: builder.mutation<AuthResponse, RegisterInput>({
      query: body => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          // 1. Регистрация прошла успешно
          const registrationResult = await queryFulfilled

          // 2. Автоматически вызываем login с теми же email/password
          const loginMutation = apiSlice.endpoints.login.initiate({
            email: registrationResult.data.user.email,
            password: _.password, // ⚠️ Пароль приходит из аргумента мутации
          })

          // 3. Диспатчим login
          const loginResult = await dispatch(loginMutation).unwrap()

          // 4. Токен уже сохранится внутри `login.onQueryStarted`
          console.log(
            'Автоматический вход после регистрации успешен:',
            loginResult
          )
        } catch (error) {
          console.error(
            'Ошибка при автоматическом входе после регистрации:',
            error
          )
          // Можно показать уведомление
          alert('Регистрация прошла, но вход не удался. Войдите вручную.')
        }
      },
      invalidatesTags: ['User'],
    }),
    login: builder.mutation<AuthResponse, LoginInput>({
      query: body => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      // Сохраняем токен, например, в localStorage
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled
          // Сохраняем токен
          localStorage.setItem('token', result.data.token)
          // Можно отправить action в Redux, чтобы установить пользователя
          dispatch(
            apiSlice.util.updateQueryData(
              'getMe',
              undefined,
              () => result.data.user
            )
          )
        } catch (error) {
          console.error(error)
          alert('Ошибка при входе')
        }
      },
    }),
    logout: builder.mutation<void, void>({
      queryFn: () => {
        // Только клиентская очистка
        localStorage.removeItem('token')
        return { data: undefined }
      },
      invalidatesTags: ['User'],
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: body => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<
      void,
      { token: string; newPassword: string }
    >({
      query: ({ token, newPassword }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { token, newPassword },
      }),
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,

  useGetTransactionsQuery,
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useUpdateTransactionMutation,

  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,

  useGetReportsQuery,
} = apiSlice
