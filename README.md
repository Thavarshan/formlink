[![Formlink](./assets/Banner.png)](https://github.com/Thavarshan/formlink)

# About Formlink

[![Latest Version on npm](https://img.shields.io/npm/v/jerome-formlink.svg)](https://www.npmjs.com/package/jerome-formlink)
[![Test](https://github.com/Thavarshan/formlink/actions/workflows/test.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/test.yml)
[![Lint](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml/badge.svg)](https://github.com/Thavarshan/formlink/actions/workflows/lint.yml)
[![Total Downloads](https://img.shields.io/npm/dt/formlink.svg)](https://www.npmjs.com/package/formlink)

Formlink is inspired by Inertia.js's form helpers, but without the extra baggage. Designed specifically for traditional Laravel and Vue.js SPA applications, it simplifies form handling by removing unnecessary boilerplate. With Formlink, you get powerful form submission and validation helpers that integrate seamlessly with Laravel backend responses, offering all the essential features without the overhead. It's easy to use and takes care of the repetitive tasks, allowing you to focus on building your application rather than writing boilerplate code.

Key Features:

- Reactive form data with Vue 3 support.
- Automatic CSRF token handling for Laravel.
- Simplified API with methods for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and more.
- Error handling and validation integration with Laravel.
- File upload progress tracking.

## Getting Started

### Prerequisites

Make sure you have Node.js installed:

```sh
npm install npm@latest -g
```

### Installation

1. Install the Formlink package via npm:

   ```sh
   npm install formlink
   ```

2. Import Formlink in your Vue components:

   ```javascript
   import { useForm } from 'formlink';
   ```

3. Setup a form in your Vue component:

   ```javascript
   const form = useForm({
     name: '',
     email: '',
     message: ''
   });
   ```

## Usage

Formlink is a Vue composable for handling form data and submissions. Here's how you can use it with Vue:

### Basic Form Submission

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="form.name" type="text" placeholder="Name" />
    <input v-model="form.email" type="email" placeholder="Email" />
    <textarea v-model="form.message" placeholder="Your Message"></textarea>
    <button :disabled="form.processing" type="submit">Send</button>
  </form>
</template>

<script>
import { useForm } from 'formlink';

export default {
  setup() {
    const form = useForm({
      name: '',
      email: '',
      message: ''
    });

    const submitForm = async () => {
      try {
        await form.post('/contact');
        alert('Form submitted successfully');
      } catch (errors) {
        console.error('Form submission failed:', form.errors);
      }
    };

    return { form, submitForm };
  }
};
</script>
```

### Handling Errors and Validations

Formlink integrates with Laravel validation responses, automatically capturing errors.

```vue
<p v-if="form.errors.name">{{ form.errors.name }}</p>
```

### Progress Handling for File Uploads

```vue
<template>
  <form @submit.prevent="uploadFile">
    <input type="file" @change="handleFileChange" />
    <p v-if="form.progress">{{ form.progress.percentage }}% uploaded</p>
    <button :disabled="form.processing" type="submit">Upload</button>
  </form>
</template>

<script>
import { useForm } from 'formlink';

export default {
  setup() {
    const form = useForm({
      file: null
    });

    const handleFileChange = (e) => {
      form.data.file = e.target.files[0];
    };

    const uploadFile = async () => {
      await form.post('/upload', {
        onProgress: (progress) => {
          console.log(progress);
        }
      });
    };

    return { form, handleFileChange, uploadFile };
  }
};
</script>
```

## API Reference

### `useForm<TForm>(initialData: TForm)`

Create a reactive form object.

### Methods

#### `submit(method: Method, url: string, options?: FormOptions<TForm>)`

Submit the form with any HTTP method.

#### `post(url: string, options?: FormOptions<TForm>)`

Submit the form with a `POST` request.

#### `get(url: string, options?: FormOptions<TForm>)`

Submit the form with a `GET` request.

#### `put(url: string, options?: FormOptions<TForm>)`

Submit the form with a `PUT` request.

#### `patch(url: string, options?: FormOptions<TForm>)`

Submit the form with a `PATCH` request.

#### `delete(url: string, options?: FormOptions<TForm>)`

Submit the form with a `DELETE` request.

#### `options(url: string, options?: FormOptions<TForm>)`

Submit the form with an `OPTIONS` request.

#### `setError(field: keyof TForm, message: string)`

Set a specific error for a form field.

#### `clearErrors()`

Clear all form errors.

#### `reset(...fields: (keyof TForm)[])`

Reset form data to its initial state or reset specific fields.

#### `cancel()`

Cancel an ongoing form submission.

## Roadmap

- [x] Add GET, POST, PUT, DELETE methods.
- [ ] Add advanced file upload handling.
- [ ] Improve validation handling.
- [ ] Support additional form submission events (e.g., `onAbort`).

See the [open issues](https://github.com/Thavarshan/formlink/issues) for a list of proposed features (and known issues).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

We’re currently looking for help in the following areas:

- Expanding test coverage for async task management
- Improving documentation for more advanced use cases
- Adding support for additional HTTP methods and protocols

To contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your Changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Authors

- **[Jerome Thayananthajothy]** - *Initial work* - [Thavarshan](https://github.com/Thavarshan)

See also the list of [contributors](https://github.com/Thavarshan/formlink/contributors) who participated in this project.

## Acknowledgments

- Inspired by **InertiaJS** for its approach to form handling.
- A special thanks to **Jonathan Reinink** for his work on InertiaJS.
