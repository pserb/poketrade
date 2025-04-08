# poketrade

- django as a backend
- nextjs as a frontend

## to run:
### the backend:
- this project uses uv
- `cd backend`
- `uv run manage.py runserver`

### the frontend:
- `cd frontend`
- `npm i`
- `npm run dev`

### viewing:
- `localhost:8000` for the backend
- `localhost:3000` for the frontend

## Architecture Overview

The application follows a standard client-server architecture with a complete separation of concerns:

- **Backend**: Django REST Framework API serving data via JSON endpoints
- **Frontend**: Next.js React application consuming the API

## Authentication System

The application uses JWT (JSON Web Token) authentication:

1. **Token Generation**: When a user logs in or registers, the backend generates an access token and refresh token
2. **Token Storage**: Tokens are stored as cookies in the client browser
3. **Request Authentication**: The frontend automatically includes the JWT in the Authorization header for all API requests
4. **Token Refresh**: When the access token expires, the refresh token can be used to obtain a new one
5. **Token Validation**: The backend validates the token on protected routes

The frontend handles authentication state through React Context API (`AuthContext`), which provides:
- User state management
- Login/register/logout functionality
- Token handling
- Protected routes

## Data Flow

1. The frontend makes axios requests to the backend API
2. Authentication is handled via JWT interceptors that automatically attach the token
3. CRUD operations are performed through REST endpoints
4. Data is rendered in React components with proper loading and error states

## Adding New Models

To extend the application with additional models beyond the current `TestModel`:

### Backend Steps:

1. Define a new model in `backend/apis/models.py`:
```python
class NewModel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
```

2. Create a serializer in `backend/apis/serializers.py`:
```python
class NewModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewModel
        fields = '__all__'
```

3. Add a view in `backend/apis/views.py`:
```python
class NewModelViewSet(viewsets.ModelViewSet):
    queryset = NewModel.objects.all()
    serializer_class = NewModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
```

4. Register the view in `backend/apis/urls.py`:
```python
router.register(r'newmodel', NewModelViewSet)
```

5. Run migrations:
```bash
uv run manage.py makemigrations
uv run manage.py migrate
```

### Frontend Steps:

1. Create a new interface in your component file:
```typescript
export interface NewModel {
    id: number;
    name: string;
    description: string;
    created_at: string;
}
```

2. Create components for displaying and managing the model:
   - List component
   - Item component
   - Form component for adding/editing

3. Use the API utility to perform CRUD operations:
```typescript
// Fetch data
const fetchData = async () => {
    const response = await api.get("/newmodel/");
    setData(response.data);
};

// Add item
const addItem = async (name: string, description: string) => {
    await api.post("/newmodel/", { name, description });
    fetchData();
};

// Delete item
const deleteItem = async (id: number) => {
    await api.delete(`/newmodel/${id}/`);
    fetchData();
};
```

4. Update your UI components to include the new model functionality

The existing pattern in the codebase provides a solid template for extending the application with additional models while maintaining a clean separation between frontend and backend concerns.