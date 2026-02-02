import { useState } from 'react'
import { Fab } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { AddTransaction } from '../molecules/AddTransaction'
import { CustomModal } from '../molecules/CustomModal'

export const TransactionModal = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Кнопка открытия модалки */}
      {!open && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setOpen(true)}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Модальное окно */}
      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        title="Добавить транзакцию"
        confirmText="Закрыть"
        showCancel={false} // Не нужна "отмена", просто закрыть
      >
        <AddTransaction onClose={() => setOpen(false)} />
      </CustomModal>
    </>
  )
}
