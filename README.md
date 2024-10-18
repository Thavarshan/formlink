[![Formlink](./assets/Banner.png)](https://github.com/Thavarshan/formlink)

# Formlink

[![Latest Version on npm](https://img.shields.io/npm/v/formlink.svg)](https://www.npmjs.com/package/formlink)
[![Test](https://github.com/Thavarshan/formlink/actions/workflows/test.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/test.yml)
[![Lint](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml)
[![Total Downloads](https://img.shields.io/npm/dt/formlink.svg)](https://www.npmjs.com/package/formlink)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A type-safe form handling library for Laravel + Vue.js applications, inspired by Inertia.js. Formlink provides a seamless bridge between your Laravel backend and Vue.js frontend, handling everything from form submissions to file uploads with minimal boilerplate.

## Features

- ✨ **Type Safety** - Full TypeScript support with type inference
- 🚀 **Zero Configuration** - Works out of the box with Laravel
- 📦 **Built-in CSRF Protection** - Automatic CSRF token handling
- 🔄 **Progress Tracking** - Real-time file upload progress
- 🎯 **Smart Error Handling** - Automatic Laravel validation error handling
- 🔌 **Event Hooks** - Rich lifecycle hooks for form events
- ⚡ **Reactive Forms** - Vue 3 composition API support
- 📱 **Framework Agnostic** - Can be used with any backend

## Quick Start

### Installation

```bash
npm install formlink
# or
yarn add formlink
# or
pnpm add formlink
```

### Basic Usage

```typescript
import { useForm } from 'formlink';

// Define your form type
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

// Create a type-safe form instance
const form = useForm<ContactForm>({
  name: '',
  email: '',
  message: ''
});

// Submit the form
await form.post('/api/contact');
```

### Complete Example

```vue
<template>
  <form @submit.prevent="submit">
    <!-- Name field -->
    <div>
      <input
        v-model="form.name"
        type="text"
        :class="{ 'error': form.errors.name }"
      />
      <span v-if="form.errors.name" class="error">
        {{ form.errors.name }}
      </span>
    </div>

    <!-- Email field -->
    <div>
      <input
        v-model="form.email"
        type="email"
        :class="{ 'error': form.errors.email }"
      />
      <span v-if="form.errors.email" class="error">
        {{ form.errors.email }}
      </span>
    </div>

    <!-- File upload with progress -->
    <div>
      <input
        type="file"
        @change="handleFile"
      />
      <div v-if="form.progress" class="progress">
        {{ form.progress.percentage }}% uploaded
      </div>
    </div>

    <!-- Submit button -->
    <button
      type="submit"
      :disabled="form.processing"
    >
      {{ form.processing ? 'Sending...' : 'Send Message' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'formlink';

interface ContactForm {
  name: string;
  email: string;
  file: File | null;
}

const form = useForm<ContactForm>({
  name: '',
  email: '',
  file: null
});

const handleFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    form.file = file;
  }
};

const submit = async () => {
  await form.post('/api/contact', {
    onBefore: () => {
      // Called before the request
    },
    onProgress: (progress) => {
      // Track upload progress
      console.log(`${progress.percentage}% uploaded`);
    },
    onSuccess: (response) => {
      // Handle successful submission
    },
    onError: (errors) => {
      // Handle validation errors
    },
    onFinish: () => {
      // Called after the request (success or error)
    }
  });
};
</script>
```

## Advanced Features

### Form States

Monitor form state using reactive properties:

```typescript
form.processing  // Is the form being submitted?
form.progress    // Upload progress data
form.errors      // Validation errors
form.isDirty    // Has the form been modified?
```

### HTTP Methods

Support for all common HTTP methods:

```typescript
form.get(url)     // GET request
form.post(url)    // POST request
form.put(url)     // PUT request
form.patch(url)   // PATCH request
form.delete(url)  // DELETE request
```

### Form Transformation

Transform data before submission:

```typescript
form.transform((data) => ({
  ...data,
  name: data.name.trim().toLowerCase()
}));
```

### Error Handling

Set and clear errors manually:

```typescript
form.setError('email', 'Invalid email format');
form.clearErrors();
```

### Reset Functionality

Reset form data:

```typescript
// Reset all fields
form.reset();

// Reset specific fields
form.reset('email', 'name');
```

## Configuration

### Custom Axios Instance

```typescript
import axios from 'axios';

const customAxios = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000
});

const form = useForm(data, customAxios);
```

### Default Options

```typescript
const form = useForm<FormData>({
  // Initial data
}, {
  // Axios instance (optional)
  axios: customAxios,

  // Form options (optional)
  options: {
    resetOnSuccess: true,
    preserveScroll: true
  }
});
```

## TypeScript Support

Formlink is written in TypeScript and provides full type safety:

```typescript
interface UserForm {
  name: string;
  email: string;
  age: number;
  preferences?: {
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
}

const form = useForm<UserForm>({
  name: '',
  email: '',
  age: 0,
  preferences: {
    newsletter: false,
    theme: 'light'
  }
});

// Type error ❌
form.invalid_field = 'value';

// Type error ❌
form.age = 'twenty';

// Valid ✅
form.name = 'John Doe';
```

## Best Practices

1. **Type Definition**: Always define types for your form data
2. **Error Handling**: Use the provided hooks for error handling
3. **Progress Tracking**: Implement progress tracking for file uploads
4. **Form Reset**: Reset forms after successful submission
5. **Validation**: Handle backend validation errors appropriately

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Thavarshan/formlink/blob/main/.github/CONTRIBUTING.md) for details.

To start contributing:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Thavarshan/formlink.git

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

## License

Formlink is open-sourced software licensed under the [MIT license](LICENSE.md).

## Acknowledgments

- Special thanks to [**Jonathan Reinink**](https://github.com/reinink) for his work on [**InertiaJS**](https://inertiajs.com/), which inspired this project.
