import { FormControl, InputLabel, Select } from '@mui/material'
import type { SelectProps } from '@mui/material'

interface CustomSelectProps extends Omit<SelectProps<string>, 'children'> {
  label: string
  width?: number
  children: React.ReactNode
}

export const CustomSelect = ({
  children,
  label,
  width,
  ...props
}: CustomSelectProps) => {
  return (
    <FormControl sx={{ width }}>
      <InputLabel id="select-label" htmlFor="select-label">
        {label}
      </InputLabel>
      <Select
        defaultValue=""
        id="select"
        label={label}
        SelectDisplayProps={{
          'aria-labelledby': 'select-label',
        }}
        {...props}
      >
        {children}
      </Select>
    </FormControl>
  )
}
