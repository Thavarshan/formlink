[![Formlink](./assets/Banner.png)](https://github.com/Thavarshan/formlink)

# Formlink

[![Latest Version on npm](https://img.shields.io/npm/v/formlink.svg)](https://www.npmjs.com/package/formlink)
[![Test](https://github.com/Thavarshan/formlink/actions/workflows/test.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/test.yml)
[![Lint](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml)
[![Total Downloads](https://img.shields.io/npm/dt/formlink.svg)](https://www.npmjs.com/package/formlink)

Formlink is a TypeScript library inspired by Inertia.js's form helpers, designed to streamline form handling in traditional Laravel-Vue SPA applications. It simplifies form submissions, validations, and repetitive tasks by integrating directly with Laravel's backend, reducing boilerplate and offering a more efficient development experience.

## Why Formlink?

Formlink provides a tailored solution specifically for Laravel and Vue.js, offering a clean, reactive API for handling form data, error handling, and file uploads. It handles common tasks like CSRF token management and validation error handling, so you can focus on building features, not re-writing form logic.

### Key Features

- **Vue 3 compatibility:** Reactive form handling using Vue 3.
- **Laravel integration:** Built-in CSRF token management and automatic error handling for Laravel validation responses.
- **Flexible HTTP methods:** Simplified API for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and more.
- **File upload tracking:** Supports progress tracking for file uploads.
- **Minimal boilerplate:** Focuses on eliminating redundant code in traditional Laravel-Vue applications.

## Getting Started

### Prerequisites

Ensure you have Node.js installed:

```bash
npm install npm@latest -g
```

### Installation

1. Install Formlink via npm:

   ```bash
   npm install formlink
   ```

2. Import and use it in your Vue component:

   ```javascript
   import { useForm } from 'formlink';
   ```

## Usage

Formlink simplifies form submission in Vue by providing a reactive `useForm` composable.

### Basic Form Submission

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="form.name" type="text" placeholder="Name" />
    <p v-if="form.errors.name">{{ form.errors.name }}</p>
    <input v-model="form.email" type="email" placeholder="Email" />
    <p v-if="form.errors.email">{{ form.errors.email }}</p>
    <textarea v-model="form.message" placeholder="Message"></textarea>
    <button :disabled="form.processing" type="submit">Submit</button>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'formlink';

const form = useForm<{
  name: string;
  email: string;
  message: string;
}>({
  name: '',
  email: '',
  message: ''
});

const submitForm = async () => {
  form.post('/contact', {
    onSuccess: () => {
      alert('Form submitted successfully');
    },

    onFinish: () => {
      form.reset();
    },

    onError: () => {
      alert('Form submission failed');
    }
  });
};
</script>
```

### Handling Validation Errors

Formlink integrates seamlessly with Laravel’s validation responses. Validation errors can be easily displayed in your Vue template:

```vue
<p v-if="form.errors.name">{{ form.errors.name }}</p>
```

### File Upload Progress

Tracking file upload progress is simple with Formlink:

```vue
<template>
  <form @submit.prevent="uploadFile">
    <input type="file" @change="handleFileChange" />
    <p v-if="form.progress">{{ progressPercentage }}% uploaded</p>
    <button :disabled="form.processing" type="submit">Upload</button>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'formlink';
import { ref } from 'vue';

const progressPercentage = ref(0);

const form = useForm<{
  file: File | null;
}>({ file: null });

const handleFileChange = (e) => {
  form.file = e.target.files[0];
};

const uploadFile = async () => {
  await form.post('/upload', {
    onProgress: (progress) => {
      progressPercentage.value = progress.percentage;
    }
  });
};
</script>
```

## API Reference

### `useForm<TForm>(initialData: TForm)`

Initializes a reactive form object.

### Methods

- `submit(method: Method, url: string, options?: FormOptions<TForm>)`: Submit the form with a specified HTTP method.
- `post(url: string, options?: FormOptions<TForm>)`: Submit the form with a `POST` request.
- `get(url: string, options?: FormOptions<TForm>)`: Submit the form with a `GET` request.
- `put(url: string, options?: FormOptions<TForm>)`: Submit the form with a `PUT` request.
- `patch(url: string, options?: FormOptions<TForm>)`: Submit the form with a `PATCH` request.
- `delete(url: string, options?: FormOptions<TForm>)`: Submit the form with a `DELETE` request.
- `setError(field: keyof TForm, message: string)`: Set an error for a specific field.
- `clearErrors()`: Clear all form errors.
- `reset(...fields: (keyof TForm)[])`: Reset form data or specific fields.
- `cancel()`: Cancel an ongoing form submission.

## Roadmap

- [x] Add core HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- [ ] Implement advanced file upload handling.
- [ ] Enhance validation error handling.

For more details on upcoming features and known issues, check out the [open issues](https://github.com/Thavarshan/formlink/issues).

## Contributing

Contributions are what make the open-source community such a great place to learn and collaborate. Any contribution to Formlink is highly appreciated!

To contribute:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

Formlink is open-sourced software licensed under the [MIT license](LICENSE.md).

## Acknowledgments

- Special thanks to **Jonathan Reinink** for his work on **InertiaJS**, which inspired this project.
