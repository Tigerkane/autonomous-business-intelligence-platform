import { getCSVTemplate } from '@/server/cleaner';

export async function GET() {
  const template = getCSVTemplate();
  return new Response(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="retail_sales_template.csv"',
    },
  });
}
