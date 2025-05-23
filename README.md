[![Formlink](./assets/Banner.png)](https://github.com/Thavarshan/formlink)

# Formlink

[![Latest Version on npm](https://img.shields.io/npm/v/formlink.svg)](https://www.npmjs.com/package/formlink)
[![Test](https://github.com/Thavarshan/formlink/actions/workflows/test.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/test.yml)
[![Lint](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml)
[![Total Downloads](https://img.shields.io/npm/dt/formlink.svg)](https://www.npmjs.com/package/formlink)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Formlink is a comprehensive, type-safe form-handling library for modern web applications. Built with TypeScript-first design, it provides seamless form state management, validation, file uploads, and HTTP request handling with built-in error management and progress tracking.

## Features

- Full TypeScript Support: Complete type safety with intelligent type inference
- Zero Configuration: Works out of the box with any backend framework
- Built-in CSRF Protection: Automatic CSRF token handling for Laravel and other frameworks
- Real-time Progress Tracking: File upload progress with detailed metrics
- Intelligent Error Handling: Automatic validation error management with HTTP status awareness
- Advanced State Management: Comprehensive form state tracking with dirty field detection
- Event-driven Architecture: Rich lifecycle hooks for complete control
- Framework Agnostic: Works with Vue, React, Angular, or vanilla JavaScript
- Complete HTTP Support: All HTTP methods with request/response transformation
- Smart Reset & Defaults: Flexible form reset with customizable default values
- Debounced Operations: Built-in debouncing for search and auto-save scenarios
- Request Cancellation: Cancel ongoing requests with proper cleanup
- Debug Mode: Development-friendly debugging with detailed logging
- Cross-platform: Browser and Node.js compatible

## Installation

```bash
npm install formlink
# or
yarn add formlink
# or
pnpm add formlink
```

## Quick Start

### Basic Form

```typescript
import { useForm } from 'formlink';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const form = useForm<ContactForm>({
  name: '',
  email: '',
  message: ''
});

// Simple submission
await form.post('/api/contact');

// Check form state
console.log(form.processing); // false
console.log(form.wasSuccessful); // true
console.log(form.errors); // {}
```

### Complete Vue.js Example

```vue
<template>
  <form @submit.prevent="submit" class="contact-form">
    <!-- Form State Indicators -->
    <div v-if="form.processing" class="loading">Submitting...</div>

    <div v-if="form.recentlySuccessful" class="success">Message sent successfully!</div>

    <!-- Name Field -->
    <div class="field">
      <label for="name">Name</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        :class="{ error: form.hasError('name') }"
        @input="form.markFieldDirty('name')"
      />
      <span v-if="form.hasError('name')" class="error-message">
        {{ form.getError('name') }}
      </span>
    </div>

    <!-- Email Field -->
    <div class="field">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        :class="{ error: form.hasError('email') }"
        @input="form.markFieldDirty('email')"
      />
      <span v-if="form.hasError('email')" class="error-message">
        {{ form.getError('email') }}
      </span>
    </div>

    <!-- File Upload with Progress -->
    <div class="field">
      <label for="attachment">Attachment</label>
      <input id="attachment" type="file" @change="handleFile" :disabled="form.processing" />

      <!-- Upload Progress -->
      <div v-if="form.progress" class="progress-bar">
        <div class="progress-fill" :style="{ width: form.progress.percentage + '%' }"></div>
        <span class="progress-text">
          {{ form.progress.percentage }}% uploaded ({{ formatBytes(form.progress.loaded) }} /
          {{ formatBytes(form.progress.total) }})
        </span>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="actions">
      <button type="submit" :disabled="form.processing || !form.isDirty" class="submit-btn">
        {{ form.processing ? 'Sending...' : 'Send Message' }}
      </button>

      <button type="button" @click="form.reset()" :disabled="form.processing" class="reset-btn">Reset</button>

      <button type="button" @click="form.cancel()" v-if="form.processing" class="cancel-btn">Cancel</button>
    </div>

    <!-- Form Debug Info (Development) -->
    <div v-if="isDev" class="debug-info">
      <h4>Form State</h4>
      <pre>{{ JSON.stringify(form.getStateSummary(), null, 2) }}</pre>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'formlink';
import { computed } from 'vue';

interface ContactForm {
  name: string;
  email: string;
  message: string;
  attachment: File | null;
}

const form = useForm<ContactForm>({
  name: '',
  email: '',
  message: '',
  attachment: null
});

// Setup validation rules
form.rules = {
  name: [
    { validate: (value) => !!value, message: 'Name is required' },
    { validate: (value) => (value as string).length >= 2, message: 'Name must be at least 2 characters' }
  ],
  email: [
    { validate: (value) => !!value, message: 'Email is required' },
    { validate: (value) => /\S+@\S+\.\S+/.test(value as string), message: 'Invalid email format' }
  ],
  message: [
    { validate: (value) => !!value, message: 'Message is required' },
    { validate: (value) => (value as string).length >= 10, message: 'Message must be at least 10 characters' }
  ]
};

const isDev = computed(() => process.env.NODE_ENV === 'development');

const handleFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    form.attachment = file;
    form.markFieldDirty('attachment');
  }
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const submit = async () => {
  // Validate before submission
  const isValid = await form.validate();
  if (!isValid) {
    return; // Stop if validation fails
  }

  await form.post('/api/contact', {
    onBefore: () => {
      console.log('Starting form submission');
    },
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress.percentage}%`);
    },
    onSuccess: (response) => {
      console.log('Form submitted successfully', response.data);
      // Form will be reset automatically if resetOnSuccess is true
    },
    onError: (errors) => {
      console.log('Validation errors occurred', errors);
    },
    onFinish: () => {
      console.log('Form submission completed');
    }
  });
};
</script>
```

## API Reference

### Form Creation

#### `useForm<T>(initialData: T, axiosInstance?: AxiosInstance): Form<T>`

Creates a new form instance with the specified initial data.

```typescript
const form = useForm({
  username: '',
  password: ''
});

// With custom Axios instance
const customAxios = axios.create({ baseURL: '/api' });
const form = useForm(data, customAxios);
```

### Form Properties

| Property             | Type                                              | Description                                                      |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| `data`               | `T`                                               | The current form data                                            |
| `errors`             | `Partial<Record<keyof T \| 'formError', string>>` | Validation errors for each field                                 |
| `processing`         | `boolean`                                         | Whether the form is currently being submitted                    |
| `progress`           | `Progress \| null`                                | Upload progress information                                      |
| `wasSuccessful`      | `boolean`                                         | Whether the last submission was successful                       |
| `recentlySuccessful` | `boolean`                                         | Whether the form was recently successful (UI feedback)           |
| `isDirty`            | `boolean`                                         | Whether any field has been modified                              |
| `rules`              | `ValidationRules<T>`                              | Validation rules for form fields                                 |
| `state`              | `FormState`                                       | Current form state (IDLE, PROCESSING, SUCCESS, ERROR, CANCELLED) |

### Form Methods

#### HTTP Methods

```typescript
// HTTP request methods
form.get(url: string, options?: FormOptions): Promise<void>
form.post(url: string, options?: FormOptions): Promise<void>
form.put(url: string, options?: FormOptions): Promise<void>
form.patch(url: string, options?: FormOptions): Promise<void>
form.delete(url: string, options?: FormOptions): Promise<void>
form.options(url: string, options?: FormOptions): Promise<void>

// Generic submission method
form.submit(method: Method, url: string, options?: FormOptions): Promise<void>

// Debounced submission (useful for search/auto-save)
form.submitDebounced(method: Method, url: string, options?: FormOptions, debounceTime?: number): void
```

#### State Management

```typescript
// Dirty field tracking
form.markFieldDirty(field: keyof T): void
form.isFieldDirty(field: keyof T): boolean
form.getDirtyFields(): Set<keyof T>
form.clearDirtyFields(): void

// State checking
form.isState(state: FormState): boolean
form.getStateSummary(): FormStateSummary
```

#### Error Handling

```typescript
// Error management
form.setError(field: keyof T | 'formError', message: string): void
form.setErrors(errors: Partial<Record<keyof T | 'formError', string>>): void
form.clearErrors(): void
form.clearError(field: keyof T | 'formError'): void
form.hasErrors(): boolean
form.hasError(field: keyof T | 'formError'): boolean
form.getError(field: keyof T | 'formError'): string | undefined
```

#### Form Reset & Defaults

```typescript
// Reset functionality
form.reset(): void                        // Reset all fields
form.reset(...fields: (keyof T)[]): void // Reset specific fields

// Default value management
form.setDefaults(): void                                    // Set current data as defaults
form.setDefaults(field: keyof T, value: any): void        // Set single field default
form.setDefaults(fields: Partial<T>): void                 // Set multiple defaults
```

#### Validation

```typescript
// Field validation
form.validateField(field: keyof T): Promise<boolean>
form.validateDirtyFields(): Promise<boolean>
form.validate(onlyDirty?: boolean): Promise<boolean>
```

#### Data Transformation & Serialization

```typescript
// Data transformation before submission
form.transform(callback: (data: T) => object): Form<T>

// Serialization
form.toJSON(includeDefaults?: boolean): string
form.fromJSON(json: string, setAsDefaults?: boolean): void
form.toFormData(): FormData
```

#### Request Management

```typescript
// Request cancellation
form.cancel(): void

// Resource cleanup
form.dispose(): void
```

### Form Options

The `FormOptions` interface provides comprehensive hooks for form submission lifecycle:

```typescript
interface FormOptions<T> {
  resetOnSuccess?: boolean; // Reset form after success
  onBefore?: () => void; // Before submission starts
  onSuccess?: (response: AxiosResponse) => void; // On successful response
  onCanceled?: () => void; // On request cancellation
  onError?: (errors: Partial<Record<keyof T, string>>) => void; // On validation errors
  onFinish?: () => void; // After submission completes
  onProgress?: (progress: Progress) => void; // On upload progress
}
```

### Form States

```typescript
enum FormState {
  IDLE = 'idle', // Form is ready for input
  PROCESSING = 'processing', // Form is being submitted
  SUCCESS = 'success', // Last submission was successful
  ERROR = 'error', // Last submission had errors
  CANCELLED = 'cancelled' // Last submission was cancelled
}
```

### Progress Object

```typescript
interface Progress {
  percentage: number; // Upload percentage (0-100)
  loaded: number; // Bytes uploaded
  total: number; // Total bytes to upload
  rate?: number; // Upload rate (bytes/second)
  estimated?: number; // Estimated time remaining (seconds)
}
```

## Advanced Usage Examples

### Custom Validation Rules

```typescript
interface UserRegistration {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const form = useForm<UserRegistration>({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Advanced validation rules
form.rules = {
  username: [
    { validate: (value) => !!value, message: 'Username is required' },
    { validate: (value) => (value as string).length >= 3, message: 'Username must be at least 3 characters' },
    {
      validate: async (value) => {
        // Async validation - check username availability
        const response = await fetch(`/api/check-username/${value}`);
        const data = await response.json();
        return data.available;
      },
      message: 'Username is already taken'
    }
  ],
  email: [
    { validate: (value) => !!value, message: 'Email is required' },
    { validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string), message: 'Invalid email format' }
  ],
  password: [
    { validate: (value) => !!value, message: 'Password is required' },
    { validate: (value) => (value as string).length >= 8, message: 'Password must be at least 8 characters' },
    {
      validate: (value) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value as string),
      message: 'Password must contain uppercase, lowercase, and number'
    }
  ],
  confirmPassword: [{ validate: (value) => value === form.password, message: 'Passwords do not match' }]
};
```

### File Upload with Multiple Files

```typescript
interface FileUploadForm {
  title: string;
  description: string;
  files: File[];
  category: string;
}

const form = useForm<FileUploadForm>({
  title: '',
  description: '',
  files: [],
  category: ''
});

const handleMultipleFiles = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  form.files = files;
  form.markFieldDirty('files');
};

// Submit with progress tracking
await form.post('/api/upload', {
  onProgress: (progress) => {
    console.log(`Uploading: ${progress.percentage}%`);
    console.log(`Speed: ${(progress.rate! / 1024 / 1024).toFixed(2)} MB/s`);
    console.log(`ETA: ${progress.estimated} seconds`);
  },
  onSuccess: (response) => {
    console.log('Files uploaded:', response.data.uploadedFiles);
  }
});
```

### Search Form with Debouncing

```typescript
interface SearchForm {
  query: string;
  filters: {
    category: string;
    dateRange: string;
    sortBy: string;
  };
}

const searchForm = useForm<SearchForm>({
  query: '',
  filters: {
    category: '',
    dateRange: '',
    sortBy: 'relevance'
  }
});

// Debounced search - only search after user stops typing for 500ms
const performSearch = () => {
  searchForm.submitDebounced(
    'get',
    '/api/search',
    {
      onSuccess: (response) => {
        // Update search results
        searchResults.value = response.data.results;
      }
    },
    500
  );
};

// Watch for changes and trigger debounced search
watch(() => searchForm.query, performSearch);
watch(() => searchForm.filters, performSearch, { deep: true });
```

### Form with Data Transformation

```typescript
interface ProfileForm {
  firstName: string;
  lastName: string;
  birthDate: string;
  bio: string;
  tags: string[];
}

const form = useForm<ProfileForm>({
  firstName: '',
  lastName: '',
  birthDate: '',
  bio: '',
  tags: []
});

// Transform data before submission
form.transform((data) => ({
  ...data,
  firstName: data.firstName.trim(),
  lastName: data.lastName.trim(),
  fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
  birthDate: new Date(data.birthDate).toISOString(),
  bio: data.bio.trim(),
  tags: data.tags.filter((tag) => tag.trim() !== '').map((tag) => tag.toLowerCase())
}));
```

### Error Recovery and Retry Logic

```typescript
const form = useForm({ data: 'value' });

let retryCount = 0;
const maxRetries = 3;

const submitWithRetry = async () => {
  try {
    await form.post('/api/endpoint', {
      onError: async (errors) => {
        if (errors.formError?.includes('Network error') && retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying... Attempt ${retryCount}/${maxRetries}`);

          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));

          // Retry the submission
          submitWithRetry();
        } else {
          console.error('Max retries reached or non-recoverable error');
        }
      },
      onSuccess: () => {
        retryCount = 0; // Reset retry count on success
      }
    });
  } catch (error) {
    console.error('Submission failed:', error);
  }
};
```

### Form State Persistence

```typescript
const form = useForm({
  email: '',
  preferences: {
    newsletter: false,
    notifications: true
  }
});

// Save form state to localStorage
const saveFormState = () => {
  localStorage.setItem('formDraft', form.toJSON());
};

// Restore form state from localStorage
const restoreFormState = () => {
  const saved = localStorage.getItem('formDraft');
  if (saved) {
    form.fromJSON(saved);
  }
};

// Auto-save on changes (debounced)
watch(() => form.data, saveFormState, { deep: true });

// Restore on component mount
onMounted(restoreFormState);

// Clear saved data on successful submission
await form.post('/api/submit', {
  onSuccess: () => {
    localStorage.removeItem('formDraft');
  }
});
```

## Framework Integration

### Vue 3 Composition API

```typescript
import { useForm } from 'formlink';
import { computed, watch } from 'vue';

export function useContactForm() {
  const form = useForm({
    name: '',
    email: '',
    message: ''
  });

  const canSubmit = computed(() => form.isDirty && !form.processing && !form.hasErrors());

  const submitForm = async () => {
    const isValid = await form.validate();
    if (isValid) {
      await form.post('/api/contact');
    }
  };

  return {
    form,
    canSubmit,
    submitForm
  };
}
```

### React Hook

```typescript
import { useForm } from 'formlink';
import { useMemo, useCallback } from 'react';

export function useContactForm() {
  const form = useForm({
    name: '',
    email: '',
    message: ''
  });

  const canSubmit = useMemo(
    () => form.isDirty && !form.processing && !form.hasErrors(),
    [form.isDirty, form.processing, form.errors]
  );

  const submitForm = useCallback(async () => {
    const isValid = await form.validate();
    if (isValid) {
      await form.post('/api/contact');
    }
  }, [form]);

  return {
    form,
    canSubmit,
    submitForm
  };
}
```

## Development & Contributing

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Thavarshan/formlink.git
cd formlink

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Testing

Formlink includes comprehensive tests covering all functionality:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- form.test.ts
```

### Contributing Guidelines

We welcome contributions! Please see our [Contributing Guide](https://github.com/Thavarshan/formlink/blob/main/.github/CONTRIBUTING.md) for details.

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Quality Standards

- ✅ **TypeScript**: Full type safety required
- ✅ **Tests**: All new features must include tests
- ✅ **Documentation**: Update docs for any API changes
- ✅ **Linting**: Code must pass ESLint checks
- ✅ **Formatting**: Code must be formatted with Prettier

## License

Formlink is open-sourced software licensed under the [MIT license](LICENSE.md).

## Acknowledgments

Special thanks to:

- [**Jonathan Reinink**](https://github.com/reinink) for [**Inertia.js**](https://inertiajs.com/) which inspired this project
- The TypeScript community for excellent tooling and type definitions
- All contributors who help make Formlink better

## Support

- 📖 [Documentation](https://github.com/Thavarshan/formlink)
- 🐛 [Issue Tracker](https://github.com/Thavarshan/formlink/issues)
- 💬 [Discussions](https://github.com/Thavarshan/formlink/discussions)
- 📧 [Email Support](mailto:support@formlink.dev)

---

Made with ❤️ by [Thavarshan](https://github.com/Thavarshan)
