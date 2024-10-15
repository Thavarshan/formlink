import { reactive } from 'vue';
import { Form } from './form';
/**
 * useForm composable for managing form state and submissions.
 * @param {TForm} initialData - The initial form data.
 * @returns {object} Reactive form state and methods.
 */
export function useForm(initialData) {
    // Create an instance of the Form class, which already has reactive data
    // Use Vue's reactive system to expose the entire form instance
    return reactive(new Form(initialData));
}
