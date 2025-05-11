'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Title, 
  Alert, 
  Loader, 
  Center, 
  Tabs, 
  Button, 
  Group,
  Text,
  Badge,
  Stack,
  Box,
  Textarea,
  FileInput,
  Paper,
  List,
  ThemeIcon,
  Divider
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconEdit, 
  IconHistory, 
  IconMessage, 
  IconFile, 
  IconCheck,
  IconX,
  IconDownload,
  IconUpload
} from '@tabler/icons-react';
import ContactForm from '../../../../components/Contacts/ContactForm';

// Интерфейс для источников и статусов
interface Option {
  value: string;
  label: string;
}

// Интерфейс для комментария
interface Comment {
  id: string;
  text: string;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Интерфейс для вложения
interface Attachment {
  id: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Интерфейс для записи истории
interface HistoryRecord {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contact, setContact] = useState<any>(null);
  const [sources, setSources] = useState<Option[]>([]);
  const [statuses, setStatuses] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [partners, setPartners] = useState<Option[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Загрузка данных контакта и справочников
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем данные контакта
        const contactResponse = await fetch(`/api/contacts/${params.id}`);
        if (!contactResponse.ok) {
          throw new Error('Не удалось загрузить данные контакта');
        }
        const contactData = await contactResponse.json();
        setContact(contactData);
        
        // Загружаем источники контактов
        const sourcesResponse = await fetch('/api/contacts/sources/list');
        if (!sourcesResponse.ok) {
          throw new Error('Не удалось загрузить список источников');
        }
        const sourcesData = await sourcesResponse.json();
        
        // Загружаем статусы клиентов
        const statusesResponse = await fetch('/api/contacts/statuses/list');
        if (!statusesResponse.ok) {
          throw new Error('Не удалось загрузить список статусов');
        }
        const statusesData = await statusesResponse.json();
        
        // Загружаем список пользователей
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('Не удалось загрузить список пользователей');
        }
        const usersData = await usersResponse.json();
        
        // Загружаем список партнеров
        const partnersResponse = await fetch('/api/partners');
        if (!partnersResponse.ok) {
          throw new Error('Не удалось загрузить список партнеров');
        }
        const partnersData = await partnersResponse.json();
        
        // Загружаем комментарии
        const commentsResponse = await fetch(`/api/contacts/${params.id}/comments`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }
        
        // Загружаем вложения
        const attachmentsResponse = await fetch(`/api/contacts/${params.id}/attachments`);
        if (attachmentsResponse.ok) {
          const attachmentsData = await attachmentsResponse.json();
          setAttachments(attachmentsData);
        }
        
        // Загружаем историю изменений
        const historyResponse = await fetch(`/api/contacts/${params.id}/history`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistoryRecords(historyData);
        }
        
        // Преобразуем данные в формат для Select
        setSources(
          Object.entries(sourcesData).map(([value, label]) => ({
            value,
            label: String(label),
          }))
        );
        
        setStatuses(
          Object.entries(statusesData).map(([value, label]) => ({
            value,
            label: String(label),
          }))
        );
        
        setUsers(
          usersData.map((user: any) => ({
            value: user.id,
            label: `${user.lastName} ${user.firstName}`,
          }))
        );
        
        setPartners(
          partnersData.map((partner: any) => ({
            value: partner.id,
            label: partner.name,
          }))
        );
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);

  // Обработчик обновления контакта
  const handleUpdate = async (data: any) => {
    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось обновить контакт');
      }
      
      // Обновляем данные контакта
      const updatedContact = await response.json();
      setContact(updatedContact);
      setEditMode(false);
      
      // Обновляем историю изменений
      const historyResponse = await fetch(`/api/contacts/${params.id}/history`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistoryRecords(historyData);
      }
    } catch (err) {
      throw err;
    }
  };

  // Обработчик добавления комментария
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setCommentLoading(true);
      
      const response = await fetch(`/api/contacts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось добавить комментарий');
      }
      
      // Добавляем новый комментарий в список
      const commentData = await response.json();
      setComments([...comments, commentData]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при добавлении комментария');
    } finally {
      setCommentLoading(false);
    }
  };

  // Обработчик загрузки файла
  const handleFileUpload = async () => {
    if (!file) return;
    
    try {
      setUploadLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/contacts/${params.id}/attachments`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось загрузить файл');
      }
      
      // Добавляем новое вложение в список
      const attachmentData = await response.json();
      setAttachments([...attachments, attachmentData]);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке файла');
    } finally {
      setUploadLoading(false);
    }
  };

  // Отображение загрузки
  if (loading) {
    return (
      <Center style={{ height: 400 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" mt="md">
        {error}
      </Alert>
    );
  }

  // Отображение информации о контакте
  const ContactInfo = () => (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={3}>{`${contact.lastName} ${contact.firstName} ${contact.middleName || ''}`}</Title>
        <Badge color={contact.isLead ? 'blue' : 'green'}>
          {contact.isLead ? 'Лид' : 'Клиент'}
        </Badge>
      </Group>
      
      <Group grow>
        <Box>
          <Text size="sm" color="dimmed">Телефон</Text>
          <Text>{contact.phone}</Text>
        </Box>
        
        <Box>
          <Text size="sm" color="dimmed">Email</Text>
          <Text>{contact.email || '-'}</Text>
        </Box>
      </Group>
      
      <Group grow>
        <Box>
          <Text size="sm" color="dimmed">Источник</Text>
          <Text>{sources.find(s => s.value === contact.source)?.label || contact.source}</Text>
        </Box>
        
        <Box>
          <Text size="sm" color="dimmed">Статус</Text>
          <Text>{statuses.find(s => s.value === contact.statusClient)?.label || contact.statusClient}</Text>
        </Box>
      </Group>
      
      <Group grow>
        <Box>
          <Text size="sm" color="dimmed">Ответственный</Text>
          <Text>
            {contact.assignedTo 
              ? `${contact.assignedTo.lastName} ${contact.assignedTo.firstName}` 
              : 'Не назначен'}
          </Text>
        </Box>
        
        {contact.partnerId && (
          <Box>
            <Text size="sm" color="dimmed">Партнер</Text>
            <Text>
              {contact.partner ? contact.partner.name : partners.find(p => p.value === contact.partnerId)?.label || '-'}
            </Text>
          </Box>
        )}
      </Group>
      
      {contact.notes && (
        <Box>
          <Text size="sm" color="dimmed">Примечания</Text>
          <Text>{contact.notes}</Text>
        </Box>
      )}
      
      <Group grow>
        <Box>
          <Text size="sm" color="dimmed">Дата создания</Text>
          <Text>{new Date(contact.createdAt).toLocaleString('ru-RU')}</Text>
        </Box>
        
        <Box>
          <Text size="sm" color="dimmed">Последнее обновление</Text>
          <Text>{new Date(contact.updatedAt).toLocaleString('ru-RU')}</Text>
        </Box>
      </Group>
    </Stack>
  );

  return (
    <div className="p-4">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group position="apart">
            <Title order={2}>Информация о контакте</Title>
            <Button 
              leftIcon={<IconEdit size={16} />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Отменить редактирование' : 'Редактировать'}
            </Button>
          </Group>
        </Card.Section>
        
        <div className="mt-4">
          {editMode ? (
            <ContactForm
              initialData={contact}
              onSubmit={handleUpdate}
              sources={sources}
              statuses={statuses}
              users={users}
              partners={partners}
              isEditMode={true}
            />
          ) : (
            <Tabs defaultValue="info">
              <Tabs.List>
                <Tabs.Tab value="info" icon={<IconCheck size={14} />}>Информация</Tabs.Tab>
                <Tabs.Tab value="history" icon={<IconHistory size={14} />}>История изменений</Tabs.Tab>
                <Tabs.Tab value="comments" icon={<IconMessage size={14} />}>Комментарии</Tabs.Tab>
                <Tabs.Tab value="attachments" icon={<IconFile size={14} />}>Вложения</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="info" pt="xs">
                <Box p="md">
                  <ContactInfo />
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="history" pt="xs">
                <Box p="md">
                  <Title order={4} mb="md">История изменений</Title>
                  
                  {historyRecords.length > 0 ? (
                    <Stack spacing="xs">
                      {historyRecords.map((record) => (
                        <Paper key={record.id} p="xs" withBorder>
                          <Group position="apart">
                            <Text size="sm">
                              Поле <b>{record.field}</b> изменено с "{record.oldValue}" на "{record.newValue}"
                            </Text>
                            <Text size="xs" color="dimmed">
                              {new Date(record.timestamp).toLocaleString('ru-RU')} - 
                              {record.user.lastName} {record.user.firstName}
                            </Text>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Text color="dimmed">История изменений пуста</Text>
                  )}
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="comments" pt="xs">
                <Box p="md">
                  <Title order={4} mb="md">Комментарии</Title>
                  
                  <Stack spacing="md">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <Paper key={comment.id} p="sm" withBorder>
                          <Group position="apart" mb="xs">
                            <Text weight={500}>
                              {comment.createdBy.lastName} {comment.createdBy.firstName}
                            </Text>
                            <Text size="xs" color="dimmed">
                              {new Date(comment.createdAt).toLocaleString('ru-RU')}
                            </Text>
                          </Group>
                          <Text>{comment.text}</Text>
                        </Paper>
                      ))
                    ) : (
                      <Text color="dimmed">Нет комментариев</Text>
                    )}
                    
                    <Divider my="md" />
                    
                    <Box>
                      <Textarea
                        placeholder="Добавить комментарий..."
                        minRows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.currentTarget.value)}
                      />
                      <Group position="right" mt="md">
                        <Button 
                          onClick={handleAddComment} 
                          loading={commentLoading}
                          disabled={!newComment.trim()}
                        >
                          Добавить комментарий
                        </Button>
                      </Group>
                    </Box>
                  </Stack>
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="attachments" pt="xs">
                <Box p="md">
                  <Title order={4} mb="md">Вложения</Title>
                  
                  <Stack spacing="md">
                    {attachments.length > 0 ? (
                      <List spacing="xs">
                        {attachments.map((attachment) => (
                          <List.Item 
                            key={attachment.id}
                            icon={
                              <ThemeIcon color="blue" size={24} radius="xl">
                                <IconFile size={16} />
                              </ThemeIcon>
                            }
                          >
                            <Group position="apart">
                              <Text>{attachment.filename}</Text>
                              <Group spacing="xs">
                                <Text size="xs" color="dimmed">
                                  {new Date(attachment.createdAt).toLocaleDateString('ru-RU')}
                                </Text>
                                <Button 
                                  variant="subtle" 
                                  size="xs"
                                  component="a"
                                  href={attachment.path}
                                  target="_blank"
                                  leftIcon={<IconDownload size={14} />}
                                >
                                  Скачать
                                </Button>
                              </Group>
                            </Group>
                          </List.Item>
                        ))}
                      </List>
                    ) : (
                      <Text color="dimmed">Нет вложений</Text>
                    )}
                    
                    <Divider my="md" />
                    
                    <Box>
                      <FileInput
                        placeholder="Выберите файл"
                        label="Загрузить новое вложение"
                        value={file}
                        onChange={setFile}
                        clearable
                      />
                      <Group position="right" mt="md">
                        <Button 
                          onClick={handleFileUpload} 
                          loading={uploadLoading}
                          disabled={!file}
                          leftIcon={<IconUpload size={16} />}
                        >
                          Загрузить файл
                        </Button>
                      </Group>
                    </Box>
                  </Stack>
                </Box>
              </Tabs.Panel>
            </Tabs>
          )}
        </div>
      </Card>
    </div>
  );
}
