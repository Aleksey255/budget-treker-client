import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type Transaction = {
  _id: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
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

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Transactions', 'Categories', 'Reports'],
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
  }),
})

export const {
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
