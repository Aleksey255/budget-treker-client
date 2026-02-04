import { FormControl, InputLabel, Select } from '@mui/material'
import type { SelectProps } from '@mui/material'
import { useId } from 'react'

interface CustomSelectProps extends Omit<SelectProps<string>, 'children'> {
  label: string
  sx: object
  labelId?: string
  selectId?: string
  children: React.ReactNode
}

export const CustomSelect = ({
  children,
  label,
  sx,
  labelId: externalLabelId,
  selectId: externalSelectId,
  ...props
}: CustomSelectProps) => {
  const internalLabelId = useId()
  const internalSelectId = useId()
  const finalLabelId = externalLabelId || internalLabelId
  const finalSelectId = externalSelectId || internalSelectId

  return (
    <FormControl sx={sx}>
      <InputLabel id={finalLabelId}>{label}</InputLabel>
      <Select
        defaultValue=""
        labelId={finalLabelId}
        name={finalLabelId}
        id={finalSelectId}
        label={label}
        SelectDisplayProps={{
          'aria-labelledby': finalLabelId,
        }}
        {...props}
      >
        {children}
      </Select>
    </FormControl>
  )
}
