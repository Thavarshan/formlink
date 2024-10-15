# Formlink

**Formlink** is a form helper library designed to simplify the process of managing forms, validation errors, and form submissions, particularly in applications built with Vue.js and Laravel.

This library helps manage form state and provides a set of methods to handle form submissions seamlessly, including file uploads, form resets, transformations, and handling validation errors.

## Features

- **Reactive form state** compatible with Vue.js.
- **Validation error handling** with support for Laravel validation responses.
- **File uploads** with progress tracking.
- **Form transformation** before submission.
- **Supports CSRF tokens** (Laravel).
- **Cancelation** of form submissions.
- **Vue.js composable for easy integration**.

## Installation

Install Formlink via npm:

```bash
npm install formlink
```

or with Yarn:

```bash
yarn add formlink
```

## Vue.js Usage with `useForm` Composable

**Formlink** provides a `useForm` composable for Vue.js, making form handling and state management simple and reactive.

### Example - Basic Form Submission

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="form.data.email" type="text" placeholder="Email" />
    <span v-if="form.errors.email">{{ form.errors.email }}</span>

    <input v-model="form.data.password" type="password" placeholder="Password" />
    <span v-if="form.errors.password">{{ form.errors.password }}</span>

    <input type="checkbox" v-model="form.data.remember" /> Remember me

    <button type="submit" :disabled="form.processing">Login</button>
  </form>
</template>

<script setup>
import { useForm } from 'formlink';

const form = useForm({
  email: '',
  password: '',
  remember: false,
});

const submitForm = () => {
  form.post('/login', {
    onSuccess: () => {
      alert('Logged in successfully!');
    },
    onError: (errors) => {
      console.error('Failed to log in:', errors);
    },
  });
};
</script>
```

### Example - Handling File Uploads with Progress

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="form.data.name" type="text" placeholder="Your Name" />
    <span v-if="form.errors.name">{{ form.errors.name }}</span>

    <input type="file" @change="handleFileChange" />
    <progress v-if="form.progress" :value="form.progress.percentage" max="100">
      {{ form.progress.percentage }}%
    </progress>

    <button type="submit" :disabled="form.processing">Submit</button>
  </form>
</template>

<script setup>
import { useForm } from 'formlink';

const form = useForm({
  name: '',
  file: null,
});

const handleFileChange = (e) => {
  form.data.file = e.target.files[0];
};

const submitForm = () => {
  form.post('/upload', {
    onProgress: (progress) => {
      console.log('Progress:', progress.percentage);
    },
    onSuccess: () => {
      alert('File uploaded successfully!');
    },
    onError: (errors) => {
      console.error('File upload failed:', errors);
    },
  });
};
</script>
```

### Example - Resetting and Transforming Form Data

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="form.data.email" type="text" placeholder="Email" />
    <span v-if="form.errors.email">{{ form.errors.email }}</span>

    <input v-model="form.data.password" type="password" placeholder="Password" />
    <span v-if="form.errors.password">{{ form.errors.password }}</span>

    <button type="submit" :disabled="form.processing">Register</button>
    <button type="button" @click="resetForm">Reset</button>
  </form>
</template>

<script setup>
import { useForm } from 'formlink';

const form = useForm({
  email: '',
  password: '',
});

const submitForm = () => {
  form
    .transform((data) => ({
      ...data,
      email: data.email.toLowerCase(),
    }))
    .post('/register', {
      onSuccess: () => {
        alert('Registered successfully!');
      },
      onError: (errors) => {
        console.error('Registration failed:', errors);
      },
    });
};

const resetForm = () => {
  form.reset();
};
</script>
```

## API Reference

### `useForm<T>(initialData: T)`

Creates a new form instance using the `useForm` composable for Vue.js.

- `initialData`: An object containing the form fields.

#### Example

```ts
const form = useForm({
  email: '',
  password: '',
  remember: false,
});
```

### `form.get(url: string, options?: FormOptions<T>)`

Sends a `GET` request with the form data.

- `url`: The URL to send the request to.
- `options`: Optional configuration for the form submission (see below).

#### Example

```ts
form.get('/profile', {
  onSuccess: (response) => {
    console.log('Profile data:', response.data);
  },
});
```

### `form.post(url: string, options?: FormOptions<T>)`

Sends a `POST` request with the form data.

- `url`: The URL to send the request to.
- `options`: Optional configuration for the form submission.

#### Example

```ts
form.post('/login', {
  onSuccess: () => {
    alert('Logged in successfully!');
  },
  onError: (errors) => {
    console.error('Failed to log in:', errors);
  },
});
```

### `form.put(url: string, options?: FormOptions<T>)`

Sends a `PUT` request with the form data.

- `url`: The URL to send the request to.
- `options`: Optional configuration for the form submission.

#### Example

```ts
form.put('/profile', {
  onSuccess: () => {
    alert('Profile updated successfully!');
  },
});
```

### `form.patch(url: string, options?: FormOptions<T>)`

Sends a `PATCH` request with the form data.

- `url`: The URL to send the request to.
- `options`: Optional configuration for the form submission.

#### Example

```ts
form.patch('/profile', {
  onSuccess: () => {
    alert('Profile partially updated!');
  },
});
```

### `form.delete(url: string, options?: FormOptions<T>)`

Sends a `DELETE` request with the form data.

- `url`: The URL to send the request to.
- `options`: Optional configuration for the form submission.

#### Example

```ts
form.delete('/account', {
  onSuccess: () => {
    alert('Account deleted successfully!');
  },
});
```

### `form.reset(...fields: (keyof T)[])`

Resets the form to its initial state. You can optionally reset specific fields.

#### Example

```ts
form.reset(); // Resets the entire form

form.reset('email', 'password'); // Resets only the email and password fields
```

### `form.clearErrors()`

Clears all validation errors on the form.

#### Example

```ts
form.clearErrors();
```

### `form.setErrors(errors: Partial<Record<keyof T, string>>)`

Sets validation errors for the form fields.

#### Example

```ts
form.setErrors({
  email: 'This email is invalid',
  password: 'The password is too short',
});
```

### `form.cancel()`

Cancels an ongoing form submission if it hasn't completed yet.

#### Example

```ts
form.cancel();
```

### Options Object (`FormOptions<T>`)

The `options` object provides hooks for various stages of the form submission.

| Option       | Description                                                                   |
| ------------ | ----------------------------------------------------------------------------- |
| `onBefore`   | Called before the request is made.                                            |
| `onProgress` | Tracks progress for file uploads or large payloads.                           |
| `onSuccess`  | Called when the request succeeds. Receives the response as an argument.       |
| `onError`    | Called when the request fails. Receives the validation errors as an argument. |
| `onFinish`   | Called after the request (whether successful or failed) has completed.        |

#### Example Usage

```ts
form.post('/login', {
  onBefore: () => console.log('Submitting form...'),
  onProgress: (progress) => console.log('Progress:', progress.percentage),
  onSuccess: (response) => console.log('Login successful!', response),
  onError: (errors) => console.error('Form validation failed:', errors),
  onFinish: () => console.log('Form submission completed'),
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
