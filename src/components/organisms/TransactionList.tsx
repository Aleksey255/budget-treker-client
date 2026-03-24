import { Box, IconButton, List, Paper, Typography } from '@mui/material'
import {
  useDeleteTransactionMutation,
  useGetTransactionsQuery,
} from '@/store/apiSlice'
import { Close } from '@mui/icons-material'
import { useState } from 'react'
import { RadialTransactionChart } from '../molecules/RadialTransactionChart'

export const TransactionList = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null)
  const { data: transactions = [], isLoading } = useGetTransactionsQuery()
  const [deleteTransaction] = useDeleteTransactionMutation()

  const handleDelete = async (id: string) => {
    await deleteTransaction(id).unwrap()
  }

  if (isLoading)
    return <Typography component="p">Загрузка транзакций...</Typography>

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }, // На мобильных — в столбик, на десктопе — рядом
        gap: 3,
        width: '100%',
        alignItems: 'flex-start',
      }}
    >
      <List
        sx={{
          maxHeight: { xs: 300, md: 1000 },
          overflow: 'auto',
          flex: 1,
          order: { xs: 1, md: 0 },
          minWidth: 0,
          p: 0, // убираем отступы по умолчанию
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start', // ← ключевое: выравниваем слева
        }}
      >
        {transactions.map(item => {
          return (
            <Paper
              onMouseEnter={() => setIsHovered(item._id)}
              onMouseLeave={() => setIsHovered(null)}
              component={Box}
              key={item._id}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',

                gap: 1,
                p: 1.5,
                mb: 1,
                borderRadius: 2,
                boxShadow: 1,
                bgcolor: 'background.paper',
                transition: 'box-shadow 0.2s ease, transform 0.1s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-1px)',
                },
                maxWidth: '100%',
              }}
            >
              {/* Основная информация */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {/* Тип операции */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color:
                      item.type === 'income' ? 'success.main' : 'error.main',
                  }}
                >
                  {item.type === 'income' ? '📥 Доход' : '📤 Расход'}
                </Typography>

                {/* Категория */}
                <Typography variant="body2" color="text.secondary">
                  {item.categoryName}
                </Typography>

                {/* Сумма */}
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                >
                  {item.amount} ₽
                </Typography>

                {/* Описание */}
                {item.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic' }}
                  >
                    "{item.description}"
                  </Typography>
                )}

                {/* Дата */}
                <Typography variant="body2" color="text.disabled">
                  {new Date(item.date).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Typography>
                {/* Кнопка удаления — появляется при наведении */}
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(item._id)}
                  title="Удалить транзакцию"
                  sx={{
                    opacity: isHovered === item._id ? 1 : 0,
                    visibility: isHovered === item._id ? 'visible' : 'hidden',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          )
        })}
      </List>
      {/* Диаграммы — справа */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: { xs: '100%', md: '40%' },
          minWidth: '250px',
        }}
      >
        <RadialTransactionChart transactions={transactions} type="expense" />
        <RadialTransactionChart transactions={transactions} type="income" />
      </Box>
    </Box>
  )
}
