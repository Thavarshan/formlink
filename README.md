[![Formlink](./assets/Banner.png)](https://github.com/Thavarshan/formlink)

# Formlink

[![Latest Version on npm](https://img.shields.io/npm/v/formlink.svg)](https://www.npmjs.com/package/formlink)
[![Test](https://github.com/Thavarshan/formlink/actions/workflows/test.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/test.yml)
[![Lint](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml)
[![Total Downloads](https://img.shields.io/npm/dt/formlink.svg)](https://www.npmjs.com/package/formlink)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Formlink is a type-safe form-handling library for Laravel + Vue.js applications. It abstracts away form submissions, file uploads, and validation error handling, offering seamless integration with Laravel and Vue.js applications, inspired by Inertia.js's simplicity.

## Features

- ✨ **Type Safety**: Full TypeScript support with type inference
- 🚀 **Zero Configuration**: Works out of the box with Laravel
- 🔐 **Built-in CSRF Protection**: Automatic CSRF token handling
- 🔄 **Progress Tracking**: Real-time file upload progress
- 🎯 **Smart Error Handling**: Automatic Laravel validation error management
- ⚡ **Event Hooks**: Rich lifecycle hooks for form submission events
- 📱 **Vue 3 Ready**: Reactive forms with Vue 3 composition API
- 🛠️ **Framework Agnostic**: Can be used with any backend, not limited to Laravel

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

await form.post('/api/contact');
```

### Complete Example

```vue
<template>
  <form @submit.prevent="submit">
    <!-- Name field -->
    <div>
      <input v-model="form.name" type="text" :class="{ error: form.errors.name }" />
      <span v-if="form.errors.name">{{ form.errors.name }}</span>
    </div>

    <!-- Email field -->
    <div>
      <input v-model="form.email" type="email" :class="{ error: form.errors.email }" />
      <span v-if="form.errors.email">{{ form.errors.email }}</span>
    </div>

    <!-- File upload with progress -->
    <div>
      <input type="file" @change="handleFile" />
      <div v-if="form.progress">{{ form.progress.percentage }}% uploaded</div>
    </div>

    <!-- Submit button -->
    <button type="submit" :disabled="form.processing">
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
      console.log('Request starting');
    },
    onProgress: (progress) => {
      console.log(`${progress.percentage}% uploaded`);
    },
    onSuccess: (response) => {
      console.log('Submission successful', response.data);
    },
    onError: (errors) => {
      console.log('Validation errors', errors);
    },
    onFinish: () => {
      console.log('Request finished');
    }
  });
};
</script>
```

## Available `FormOptions`

The `FormOptions` object allows you to configure hooks and behaviors for form submissions. Here are the available options:

| Option         | Type                                         | Description                                                                 |
|----------------|----------------------------------------------|-----------------------------------------------------------------------------|
| `resetOnSuccess` | `boolean`                                   | Whether to reset the form to its initial state after a successful submission. |
| `onBefore`      | `() => void`                                 | Hook that is called before the form submission begins.                      |
| `onSuccess`     | `(response: AxiosResponse) => void`          | Hook that is called when the form submission is successful.                 |
| `onCanceled`    | `() => void`                                 | Hook that is called when the form submission is canceled.                   |
| `onError`       | `(errors: Partial<Record<keyof TForm, string>>)` | Hook that is called when validation errors occur (e.g., from a Laravel backend). |
| `onFinish`      | `() => void`                                 | Hook that is called when the form submission finishes, whether successful or not. |
| `onProgress`    | `(progress: Progress) => void`               | Hook that tracks file upload progress or long-running requests.             |

### Example of Form Options

```typescript
await form.post('/api/contact', {
  resetOnSuccess: true,
  onBefore: () => console.log('Submitting...'),
  onSuccess: (response) => console.log('Submitted', response.data),
  onError: (errors) => console.error('Validation errors:', errors),
  onFinish: () => console.log('Request finished'),
  onProgress: (progress) => console.log(`Upload ${progress.percentage}% complete`),
});
```

## Advanced Features

### Form States

Formlink provides various reactive states:

```typescript
form.processing; // Is the form being submitted?
form.progress;   // Upload progress data
form.errors;     // Validation errors
form.isDirty;    // Has the form been modified?
```

### HTTP Methods

Formlink supports multiple HTTP methods:

```typescript
form.get(url);    // GET request
form.post(url);   // POST request
form.put(url);    // PUT request
form.patch(url);  // PATCH request
form.delete(url); // DELETE request
```

### Data Transformation

You can transform form data before it is submitted:

```typescript
form.transform((data) => ({
  ...data,
  name: data.name.trim().toLowerCase()
}));
```

### Error Handling

Set or clear errors manually:

```typescript
form.setError('email', 'Invalid email format');
form.clearErrors();
```

### Reset Functionality

Reset the form data to its initial state:

```typescript
// Reset all fields
form.reset();

// Reset specific fields
form.reset('email', 'name');
```

### Custom Axios Instance

You can use a custom Axios instance for your form requests:

```typescript
import axios from 'axios';

const customAxios = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000
});

const form = useForm(data, customAxios);
```

## Contributing

Contributions are welcome! See our [Contributing Guide](https://github.com/Thavarshan/formlink/blob/main/.github/CONTRIBUTING.md) for details.

To get started:

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

Special thanks to [**Jonathan Reinink**](https://github.com/reinink) for his work on [**InertiaJS**](https://inertiajs.com/), which inspired this project.
