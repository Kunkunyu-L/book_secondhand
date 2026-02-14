/**
 * 导出数据为 CSV 文件
 * @param data 数据数组
 * @param columns 列定义 { key, title }
 * @param filename 文件名（不含扩展名）
 */
export function exportToCSV(
  data: any[],
  columns: { key: string; title: string }[],
  filename: string
) {
  const header = columns.map((c) => c.title).join(',')
  const rows = data.map((row) =>
    columns
      .map((c) => {
        let val = row[c.key]
        if (val === null || val === undefined) val = ''
        val = String(val).replace(/"/g, '""')
        return `"${val}"`
      })
      .join(',')
  )
  const csv = [header, ...rows].join('\n')
  // 添加 BOM 让 Excel 正确识别中文
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
