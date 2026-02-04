interface CustomLabelProps {
  total: number
  type: string
}

export const CustomLabel = ({ total, type }: CustomLabelProps) => {
  return (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="central"
      fill="#333"
      fontSize="16"
      fontWeight="bold"
    >
      <tspan x="50%" dy="-10">
        {total.toLocaleString()} ₽
      </tspan>
      <tspan x="50%" dy="20" fontSize="12" fontWeight="normal">
        {type}
      </tspan>
    </text>
  )
}
