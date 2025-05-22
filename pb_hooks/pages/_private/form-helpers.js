function _processPocketbaseFieldErrors(pbErrorData) {
    const fieldErrors = {};
    if (pbErrorData && typeof pbErrorData === 'object') {
        for (const key in pbErrorData) {
            if (pbErrorData[key]) {
                fieldErrors[key] = { message: pbErrorData[key].message || pbErrorData[key] };
            }
        }
    }
    return fieldErrors;
}

function _processAjvFieldErrors(ajvErrors) {
    const fieldErrors = {};
    if (Array.isArray(ajvErrors)) {
        for (const err of ajvErrors) {
            // instancePath is like "/identity" or "/password"
            const field = err.instancePath.replace(/^\//, '');
            if (field) {
                fieldErrors[field] = { message: err.message };
            }
        }
    }
    return fieldErrors;
}

module.exports = {
    validateFormWithSchema(formData, schema, ajvInstance, dbg) {
        const validate = ajvInstance.compile(schema);
        const valid = validate(formData);
        if (valid) {
            return { valid: true, data: formData, fieldErrors: {}, prettified: '' };
        } else {
            const fieldErrors = _processAjvFieldErrors(validate.errors);
            // Prettified error: join all messages
            const serverError = Object.values(fieldErrors).map(e => e.message).join(' | ');
            const response = {
                valid: false,
                data: null,
                fieldErrors,
                serverError
            };

            dbg('AJV Server-Side Validation Errors:', fieldErrors);

            return response;
        }
    },
    handlePocketbaseError(e, dbg) {

        dbg('Pocketbase Errors:', e);
        dbg('Pocketbase Errors (Orig):', e.originalError);

        let fieldErrors = {};
        let serverError = e && e.message ? e.message : 'An unknown error occurred.';
        if (
            e &&
            typeof e === 'object' &&
            e.response &&
            typeof e.response === 'object' &&
            e.response.data &&
            typeof e.response.data === 'object'
        ) {
            const pbFieldErrors = _processPocketbaseFieldErrors(e.response.data);
            fieldErrors = { ...fieldErrors, ...pbFieldErrors };
            if (e.response.message) {
                serverError = e.response.message;
            }
        }

        const response = {
            fieldErrors,
            serverError
        };

        return response;
    }
};