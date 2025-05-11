'use client';

import { useState, useEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, Text, Group, TextInput, Select, Pagination, Button, Loader, Center } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

// Определение типа данных для контакта
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  email?: string;
  source: string;
  statusClient: string;
  isLead: boolean;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

// Компонент страницы контактов
export default function ContactsPage() {
  // Состояние для хранения данных
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для таблицы
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Состояние для пагинации на стороне сервера
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  // Помощник для создания колонок
  const columnHelper = createColumnHelper<Contact>();

  // Определение колонок таблицы
  const columns = [
    columnHelper.accessor((row) => `${row.lastName} ${row.firstName} ${row.middleName || ''}`, {
      id: 'fullName',
      header: 'ФИО',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('phone', {
      header: 'Телефон',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('source', {
      header: 'Источник',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('statusClient', {
      header: 'Статус',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.assignedTo ? 
      `${row.assignedTo.lastName} ${row.assignedTo.firstName}` : 'Не назначен', {
      id: 'assignedTo',
      header: 'Ответственный',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Дата создания',
      cell: (info) => new Date(info.getValue()).toLocaleDateString('ru-RU'),
    }),
  ];

  // Инициализация таблицы
  const table = useReactTable({
    data: contacts,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Загрузка данных с сервера
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        
        // Формируем параметры запроса
        const params = new URLSearchParams({
          skip: String(pageIndex * pageSize),
          take: String(pageSize),
        });
        
        // Если есть глобальный фильтр, добавляем его как параметр поиска
        if (globalFilter) {
          params.append('search', globalFilter);
        }
        
        const response = await fetch(`/api/contacts?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить контакты');
        }
        
        const data = await response.json();
        setContacts(data.contacts);
        setTotalPages(Math.ceil(data.total / pageSize));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке контактов');
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, [pageIndex, pageSize, globalFilter]);

  return (
    <div className="p-4">
      <Card shadow="sm" padding="lg" radius="md" withBorder className="mb-4">
        <Card.Section withBorder inheritPadding py="xs">
          <Group position="apart">
            <Text weight={500}>Список контактов</Text>
            <Button>Добавить контакт</Button>
          </Group>
        </Card.Section>
        
        <Card.Section withBorder inheritPadding py="xs">
          <Group>
            <TextInput
              placeholder="Поиск..."
              icon={<IconSearch size={16} />}
              value={globalFilter || ''}
              onChange={(e) => setGlobalFilter(e.currentTarget.value)}
              style={{ width: '300px' }}
            />
            <Select
              placeholder="Фильтр по статусу"
              data={[
                { value: 'NEW_NO_PROCESSING', label: 'Новый без обработки' },
                { value: 'IN_PROGRESS', label: 'В обработке' },
                { value: 'DONE', label: 'Завершен' },
                { value: 'REJECTED', label: 'Отклонен' },
              ]}
              onChange={(value) => {
                if (value) {
                  table.getColumn('statusClient')?.setFilterValue(value);
                } else {
                  table.getColumn('statusClient')?.setFilterValue('');
                }
              }}
              clearable
              style={{ width: '200px' }}
            />
          </Group>
        </Card.Section>
        
        {loading ? (
          <Center style={{ height: 200 }}>
            <Loader />
          </Center>
        ) : error ? (
          <Center style={{ height: 200 }}>
            <Text color="red">{error}</Text>
          </Center>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="p-2 text-left border-b-2 border-gray-200 bg-gray-100 cursor-pointer"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="p-2 text-center"
                      >
                        Нет данных
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Select
                  data={[
                    { value: '10', label: '10' },
                    { value: '20', label: '20' },
                    { value: '30', label: '30' },
                    { value: '50', label: '50' },
                  ]}
                  value={String(pageSize)}
                  onChange={(value) => {
                    if (value) {
                      setPageSize(Number(value));
                      setPageIndex(0);
                    }
                  }}
                  style={{ width: '80px' }}
                />
                <Text size="sm">записей на странице</Text>
              </div>
              
              <Pagination
                total={totalPages}
                value={pageIndex + 1}
                onChange={(page) => setPageIndex(page - 1)}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
