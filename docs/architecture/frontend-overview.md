# Загальний огляд архітектури фронтенду

## Вступ

Фронтенд інформаційної системи управління бізнес-діяльністю підприємства побудований як Single Page Application (SPA) з використанням сучасних технологій та підходів до розробки. Архітектура фронтенду спроектована з урахуванням вимог до масштабованості, продуктивності, безпеки та зручності розробки.

## Ключові принципи

1. **Component-Based Architecture** - розробка на основі компонентів, що забезпечує модульність та перевикористання коду.
2. **Separation of Concerns** - розділення відповідальності між різними частинами системи.
3. **Declarative UI** - декларативний підхід до побудови інтерфейсу користувача.
4. **Unidirectional Data Flow** - односпрямований потік даних для спрощення відстеження змін стану.
5. **API-First Development** - розробка на основі API, що забезпечує гнучкість та незалежність від бекенду.
6. **Responsive Design** - адаптивний дизайн для різних пристроїв та розмірів екрану.
7. **Accessibility (a11y)** - забезпечення доступності для користувачів з обмеженими можливостями.
8. **Performance Optimization** - оптимізація продуктивності для забезпечення швидкого відгуку інтерфейсу.

## Технологічний стек

### Основні технології

- **React** - бібліотека для побудови інтерфейсу користувача
- **TypeScript** - типізована надбудова над JavaScript для забезпечення типової безпеки
- **React Router** - бібліотека для маршрутизації в React-додатках
- **React Query** - бібліотека для управління серверним станом
- **Formik** - бібліотека для управління формами
- **Yup** - бібліотека для валідації форм
- **Material-UI** - бібліотека компонентів для React на основі Material Design
- **Axios** - бібліотека для HTTP-запитів
- **bpmn-js** - бібліотека для візуалізації BPMN-моделей

### Інструменти розробки

- **Vite** - інструмент для швидкої збірки та розробки
- **ESLint** - інструмент для статичного аналізу коду
- **Prettier** - інструмент для форматування коду
- **Jest** - фреймворк для тестування
- **React Testing Library** - бібліотека для тестування React-компонентів
- **Cypress** - фреймворк для end-to-end тестування
- **Storybook** - інструмент для розробки та документування компонентів

## Структура проекту

Проект організований за принципом "feature-based" структури, де код згрупований за функціональними можливостями, а не за типами файлів. Це забезпечує кращу організацію коду та спрощує навігацію по проекту.

```
frontend/
├── public/              # Статичні файли
├── src/                 # Вихідний код
│   ├── assets/          # Ресурси (зображення, шрифти, тощо)
│   ├── components/      # Спільні компоненти
│   │   ├── common/      # Загальні компоненти
│   │   ├── forms/       # Компоненти форм
│   │   ├── layout/      # Компоненти макету
│   │   └── ui/          # UI компоненти
│   ├── config/          # Конфігурація
│   ├── contexts/        # React контексти
│   ├── hooks/           # Користувацькі хуки
│   ├── pages/           # Сторінки
│   │   ├── Auth/        # Сторінки автентифікації
│   │   ├── Dashboard/   # Дашборд
│   │   ├── Orders/      # Сторінки замовлень
│   │   ├── Customers/   # Сторінки клієнтів
│   │   ├── Products/    # Сторінки товарів
│   │   ├── Inventory/   # Сторінки запасів
│   │   ├── Finance/     # Сторінки фінансів
│   │   ├── Analytics/   # Сторінки аналітики
│   │   └── Settings/    # Сторінки налаштувань
│   ├── services/        # Сервіси для роботи з API
│   ├── store/           # Управління станом
│   ├── types/           # TypeScript типи
│   ├── utils/           # Утиліти
│   ├── App.tsx          # Головний компонент
│   ├── index.tsx        # Точка входу
│   └── routes.tsx       # Конфігурація маршрутів
├── .eslintrc.js         # Конфігурація ESLint
├── .prettierrc          # Конфігурація Prettier
├── jest.config.js       # Конфігурація Jest
├── package.json         # Залежності та скрипти
├── tsconfig.json        # Конфігурація TypeScript
└── vite.config.js       # Конфігурація Vite
```

## Архітектурні шари

Фронтенд розділений на наступні архітектурні шари:

### 1. Presentation Layer (UI)

Відповідає за відображення інтерфейсу користувача та обробку взаємодії з користувачем.

- **Компоненти** - React-компоненти для побудови інтерфейсу
- **Сторінки** - композиція компонентів для створення сторінок
- **Маршрутизація** - навігація між сторінками

### 2. Application Layer (Business Logic)

Відповідає за бізнес-логіку та управління станом додатку.

- **Хуки** - користувацькі React-хуки для інкапсуляції логіки
- **Контексти** - React-контексти для управління глобальним станом
- **Сервіси** - бізнес-логіка, незалежна від UI

### 3. Data Access Layer

Відповідає за взаємодію з API та управління даними.

- **API-клієнти** - абстракція для взаємодії з API
- **Кешування** - управління кешуванням даних
- **Адаптери** - перетворення даних між форматами API та додатку

## Потік даних

Потік даних у фронтенді організований за принципом односпрямованого потоку даних (Unidirectional Data Flow):

1. **Користувач** взаємодіє з інтерфейсом (натискає кнопку, вводить дані тощо).
2. **Компонент** обробляє подію та викликає відповідний обробник.
3. **Обробник** викликає сервіс для виконання бізнес-логіки.
4. **Сервіс** взаємодіє з API для отримання або зміни даних.
5. **API-клієнт** відправляє запит до бекенду та отримує відповідь.
6. **Сервіс** обробляє відповідь та оновлює стан.
7. **Компонент** перерендерюється з новим станом.

```
User → Component → Handler → Service → API Client → Backend
                                                      ↓
User ← Component ← State ← Service ← API Client ← Response
```

## Управління станом

Управління станом у фронтенді розділене на три рівні:

### 1. Локальний стан компонентів

Для управління локальним станом компонентів використовується `useState` та `useReducer` хуки React. Локальний стан використовується для даних, які стосуються тільки одного компонента та не потребують доступу з інших компонентів.

```jsx
const [count, setCount] = useState(0);
```

### 2. Глобальний стан додатку

Для управління глобальним станом додатку використовується React Context API. Глобальний стан використовується для даних, які потрібні багатьом компонентам та не залежать від серверних даних.

```jsx
// Створення контексту
const AuthContext = createContext();

// Провайдер контексту
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = async (credentials) => {
    // Логіка входу
  };
  
  const logout = async () => {
    // Логіка виходу
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Використання контексту
function UserProfile() {
  const { user } = useContext(AuthContext);
  
  return <div>{user.name}</div>;
}
```

### 3. Серверний стан

Для управління серверним станом використовується React Query. React Query забезпечує кешування, інвалідацію кешу, фонове оновлення, пагінацію та інші можливості для роботи з серверними даними.

```jsx
// Запит даних
const { data, isLoading, error } = useQuery(
  ['orders', page, filters],
  () => orderService.getOrders(page, filters)
);

// Мутація даних
const mutation = useMutation(
  (newOrder) => orderService.createOrder(newOrder),
  {
    onSuccess: () => {
      // Інвалідація кешу після успішного створення
      queryClient.invalidateQueries('orders');
    }
  }
);
```

## Взаємодія з API

Взаємодія з API організована через сервісний шар, який абстрагує логіку взаємодії з API від компонентів. Це забезпечує:

- **Централізацію** логіки взаємодії з API
- **Абстракцію** від конкретної реалізації API
- **Перевикористання** коду для однотипних запитів
- **Обробку помилок** на єдиному рівні

```jsx
// api.js - базовий клас для взаємодії з API
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Додавання токену до запитів
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Обробка помилок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обробка 401 помилки (неавторизований)
    if (error.response && error.response.status === 401) {
      // Перенаправлення на сторінку входу
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;

// orderService.js - сервіс для роботи з замовленнями
import api from './api';

const orderService = {
  getOrders: async (page = 1, filters = {}) => {
    const response = await api.get('/orders', {
      params: {
        page,
        ...filters
      }
    });
    
    return response.data;
  },
  
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    
    return response.data;
  },
  
  createOrder: async (order) => {
    const response = await api.post('/orders', order);
    
    return response.data;
  },
  
  updateOrder: async (id, order) => {
    const response = await api.put(`/orders/${id}`, order);
    
    return response.data;
  },
  
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    
    return response.data;
  }
};

export default orderService;
```

## Маршрутизація

Маршрутизація у фронтенді реалізована за допомогою React Router. Маршрутизація забезпечує навігацію між сторінками додатку та захист маршрутів від неавторизованого доступу.

```jsx
// routes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Компоненти
import Layout from './components/layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Orders from './pages/Orders/Orders';
import OrderDetails from './pages/Orders/OrderDetails';
import OrderForm from './pages/Orders/OrderForm';
import Customers from './pages/Customers/Customers';
import CustomerDetails from './pages/Customers/CustomerDetails';
import CustomerForm from './pages/Customers/CustomerForm';
import Products from './pages/Products/Products';
import ProductDetails from './pages/Products/ProductDetails';
import ProductForm from './pages/Products/ProductForm';
import NotFound from './pages/NotFound';

// Захищений маршрут
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Маршрути додатку
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публічні маршрути */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Захищені маршрути */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          
          {/* Замовлення */}
          <Route path="orders">
            <Route index element={<Orders />} />
            <Route path="new" element={<OrderForm />} />
            <Route path=":id" element={<OrderDetails />} />
            <Route path=":id/edit" element={<OrderForm />} />
          </Route>
          
          {/* Клієнти */}
          <Route path="customers">
            <Route index element={<Customers />} />
            <Route path="new" element={<CustomerForm />} />
            <Route path=":id" element={<CustomerDetails />} />
            <Route path=":id/edit" element={<CustomerForm />} />
          </Route>
          
          {/* Товари */}
          <Route path="products">
            <Route index element={<Products />} />
            <Route path="new" element={<ProductForm />} />
            <Route path=":id" element={<ProductDetails />} />
            <Route path=":id/edit" element={<ProductForm />} />
          </Route>
          
          {/* Інші маршрути... */}
        </Route>
        
        {/* Маршрут 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
```

## Обробка форм

Для обробки форм використовується Formik у поєднанні з Yup для валідації. Це забезпечує:

- **Управління станом форми** - відстеження значень полів, помилок, стану валідації тощо
- **Валідацію форми** - перевірка коректності введених даних
- **Обробку подій форми** - обробка відправки форми, зміни полів тощо
- **Перевикористання логіки форм** - створення спільних компонентів форм

```jsx
// OrderForm.jsx
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, MenuItem, Grid, Paper, Typography } from '@mui/material';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import productService from '../../services/productService';

// Схема валідації
const validationSchema = Yup.object({
  customerId: Yup.string().required('Клієнт обов\'язковий'),
  items: Yup.array().of(
    Yup.object({
      productId: Yup.string().required('Товар обов\'язковий'),
      quantity: Yup.number().required('Кількість обов\'язкова').min(1, 'Кількість повинна бути більше 0')
    })
  ).min(1, 'Додайте хоча б один товар')
});

const OrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  
  // Отримання даних для форми
  const { data: order, isLoading: isLoadingOrder } = useQuery(
    ['order', id],
    () => orderService.getOrderById(id),
    {
      enabled: isEditMode,
      onError: () => {
        navigate('/orders');
      }
    }
  );
  
  const { data: customers } = useQuery(
    'customers',
    () => customerService.getCustomers()
  );
  
  const { data: products } = useQuery(
    'products',
    () => productService.getProducts()
  );
  
  // Мутації для створення/оновлення замовлення
  const createMutation = useMutation(
    (newOrder) => orderService.createOrder(newOrder),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        navigate('/orders');
      }
    }
  );
  
  const updateMutation = useMutation(
    ({ id, order }) => orderService.updateOrder(id, order),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        queryClient.invalidateQueries(['order', id]);
        navigate(`/orders/${id}`);
      }
    }
  );
  
  // Формік
  const formik = useFormik({
    initialValues: {
      customerId: order?.customerId || '',
      items: order?.items || [{ productId: '', quantity: 1 }],
      notes: order?.notes || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (isEditMode) {
        updateMutation.mutate({ id, order: values });
      } else {
        createMutation.mutate(values);
      }
    }
  });
  
  // Додавання товару
  const handleAddItem = () => {
    formik.setFieldValue('items', [
      ...formik.values.items,
      { productId: '', quantity: 1 }
    ]);
  };
  
  // Видалення товару
  const handleRemoveItem = (index) => {
    const items = [...formik.values.items];
    items.splice(index, 1);
    formik.setFieldValue('items', items);
  };
  
  if (isEditMode && isLoadingOrder) {
    return <div>Завантаження...</div>;
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Редагування замовлення' : 'Створення замовлення'}
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Клієнт */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              id="customerId"
              name="customerId"
              label="Клієнт"
              value={formik.values.customerId}
              onChange={formik.handleChange}
              error={formik.touched.customerId && Boolean(formik.errors.customerId)}
              helperText={formik.touched.customerId && formik.errors.customerId}
            >
              {customers?.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          {/* Товари */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Товари
            </Typography>
            
            {formik.values.items.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    id={`items[${index}].productId`}
                    name={`items[${index}].productId`}
                    label="Товар"
                    value={item.productId}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.items?.[index]?.productId &&
                      Boolean(formik.errors.items?.[index]?.productId)
                    }
                    helperText={
                      formik.touched.items?.[index]?.productId &&
                      formik.errors.items?.[index]?.productId
                    }
                  >
                    {products?.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    id={`items[${index}].quantity`}
                    name={`items[${index}].quantity`}
                    label="Кількість"
                    value={item.quantity}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.items?.[index]?.quantity &&
                      Boolean(formik.errors.items?.[index]?.quantity)
                    }
                    helperText={
                      formik.touched.items?.[index]?.quantity &&
                      formik.errors.items?.[index]?.quantity
                    }
                  />
                </Grid>
                
                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    disabled={formik.values.items.length === 1}
                  >
                    Видалити
                  </Button>
                </Grid>
              </Grid>
            ))}
            
            <Button
              variant="outlined"
              onClick={handleAddItem}
              sx={{ mt: 2 }}
            >
              Додати товар
            </Button>
          </Grid>
          
          {/* Примітки */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              id="notes"
              name="notes"
              label="Примітки"
              value={formik.values.notes}
              onChange={formik.handleChange}
            />
          </Grid>
          
          {/* Кнопки */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={formik.isSubmitting}
              sx={{ mr: 2 }}
            >
              {isEditMode ? 'Зберегти' : 'Створити'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate(isEditMode ? `/orders/${id}` : '/orders')}
            >
              Скасувати
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default OrderForm;
```

## Висновки

Архітектура фронтенду інформаційної системи управління бізнес-діяльністю підприємства побудована на сучасних принципах та технологіях розробки, що забезпечує гнучкість, масштабованість, продуктивність та зручність розробки. Використання React у поєднанні з TypeScript, React Query, Formik та Material-UI дозволяє створити надійний та зручний інтерфейс користувача, який відповідає вимогам бізнесу та забезпечує позитивний досвід користувача.

## Додаткові матеріали

- [Компонентна архітектура](./frontend-components.md)
- [Управління станом](./frontend-state-management.md)
- [Взаємодія з API](./frontend-api-integration.md)
- [Форми та валідація](./frontend-forms.md)
- [Маршрутизація](./frontend-routing.md)
- [Продуктивність](./frontend-performance.md)
- [Безпека](./frontend-security.md)
- [Тестування](./frontend-testing.md)
