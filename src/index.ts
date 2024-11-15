import { App } from 'vue';
import { Form } from './form';
import { useForm } from './use-form';

const install = (app: App) => {
  app.component('Form', Form);
  app.config.globalProperties.$useForm = useForm;
};

export default { install };

export { Form } from './form';
export { useForm } from './use-form';
