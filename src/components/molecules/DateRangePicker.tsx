import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DesktopDatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { ru } from 'date-fns/locale/ru'
import { Box } from '@mui/material'
import { useCallback, useState } from 'react'

interface DateRangePickerProps {
  onDateChange: (range: { from: Date | null; to: Date | null }) => void
  fromLabel?: string
  toLabel?: string
}

export const DateRangePicker = ({
  onDateChange,
  fromLabel = 'С',
  toLabel = 'По',
}: DateRangePickerProps) => {
  const [from, setFrom] = useState<Date | null>(null)
  const [to, setTo] = useState<Date | null>(null)

  const handleFromChange = useCallback(
    (value: Date | null) => {
      setFrom(value)
      onDateChange({ from: value, to: to })
    },
    [onDateChange, to]
  )

  const handleToChange = useCallback(
    (value: Date | null) => {
      setTo(value)
      onDateChange({ from: from, to: value })
    },
    [onDateChange, from]
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box display="flex" gap={2} flexWrap="wrap">
        <DesktopDatePicker
          label={fromLabel}
          value={from}
          onChange={handleFromChange}
          slotProps={{
            textField: { size: 'small', fullWidth: false },
          }}
          format="dd.MM.yyyy"
          disableFuture
          maxDate={to || new Date()}
        />
        <DesktopDatePicker
          label={toLabel}
          value={to}
          onChange={handleToChange}
          slotProps={{
            textField: { size: 'small', fullWidth: false },
          }}
          format="dd.MM.yyyy"
          disableFuture
          minDate={from ?? undefined}
          maxDate={new Date()}
        />
      </Box>
    </LocalizationProvider>
  )
}
