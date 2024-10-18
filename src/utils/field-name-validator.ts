import { ReservedFieldNames } from '../enum/reserved-field-names';

/**
 * List of reserved field names.
 * @type {ReservedFieldNames[]}
 */
export const reservedFieldNames: ReservedFieldNames[] = [
  ReservedFieldNames.OPTIONS,
  ReservedFieldNames.PAGE,
  ReservedFieldNames.VALIDATE_REQUEST_TYPE,
  ReservedFieldNames.DATA,
  ReservedFieldNames.DELETE,
  ReservedFieldNames.ERROR_FOR,
  ReservedFieldNames.ERRORS_FOR,
  ReservedFieldNames.HAS_ERRORS,
  ReservedFieldNames.INITIAL,
  ReservedFieldNames.IS_DIRTY,
  ReservedFieldNames.ON_FAIL,
  ReservedFieldNames.ON_SUCCESS,
  ReservedFieldNames.PATCH,
  ReservedFieldNames.POST,
  ReservedFieldNames.PROCESSING,
  ReservedFieldNames.PUT,
  ReservedFieldNames.RECENTLY_SUCCESSFUL,
  ReservedFieldNames.RESET,
  ReservedFieldNames.SUBMIT,
  ReservedFieldNames.SUCCESSFUL,
  ReservedFieldNames.WITH_DATA,
  ReservedFieldNames.WITH_OPTIONS,
  ReservedFieldNames.FORM_ERROR,
  ReservedFieldNames.WAS_SUCCESSFUL,
  ReservedFieldNames.CANCEL,
  ReservedFieldNames.TRANSFORM,
  ReservedFieldNames.SET_ERROR,
  ReservedFieldNames.SET_ERRORS,
  ReservedFieldNames.CLEAR_ERRORS,
  ReservedFieldNames.SET_DEFAULTS,
  ReservedFieldNames.RESET_FORM,
  ReservedFieldNames.SUBMIT_FORM,
  ReservedFieldNames.GET,
  ReservedFieldNames.POST_FORM,
  ReservedFieldNames.PUT_FORM,
  ReservedFieldNames.PATCH_FORM,
  ReservedFieldNames.DELETE_FORM,
  ReservedFieldNames.OPTIONS_FORM,
  ReservedFieldNames.MARK_RECENTLY_SUCCESSFUL
];

/**
 * Guard against a list of reserved field names.
 *
 * @param {ReservedFieldNames | string} fieldName - The field name to check.
 * @throws {Error} If the field name is reserved.
 * @returns {void}
 */
export const guardAgainstReservedFieldName = (fieldName: ReservedFieldNames | string): void => {
  if (reservedFieldNames.includes(fieldName as ReservedFieldNames)) {
    throw new Error(`The field name "${fieldName}" is reserved and cannot be used in a Form or Errors instance.`);
  }
};
