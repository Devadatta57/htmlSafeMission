/*
  Join Safe Mission form: country code picker, district list, live validation after the
  first submit attempt, message counter and the thank-you message.
*/
(function (SafeMission) {
  'use strict';

  const { $, $$ } = SafeMission.utils;
  const COUNTRY_CODES = SafeMission.data.countryCodes;
  const AP_DISTRICTS = SafeMission.data.apDistricts;

  const MESSAGE_MIN = 50;
  const MESSAGE_MAX = 500;
  const FIELDS = ['name', 'mobile', 'type', 'district', 'message'];

  // National number digits only: spaces / dashes dropped, and a leading trunk 0 (e.g. 098...) removed
  const mobileDigits = (value) => value.replace(/\D/g, '').replace(/^0/, '');

  const countryByIso = (iso) => COUNTRY_CODES.find((c) => c.iso === iso);

  function validateMobile(values) {
    const digits = mobileDigits(values.mobile);
    if (!digits) return 'Please enter your mobile number.';
    if (values.country === 'IN') {
      return /^[6-9]\d{9}$/.test(digits) ? null : 'Enter a valid 10-digit mobile number.';
    }
    // Other countries: 6-14 digits, and at most 15 digits with the country code (E.164)
    const { dial } = countryByIso(values.country);
    const ok = digits.length >= 6 && digits.length + dial.length - 1 <= 15;
    return ok ? null : 'Enter a valid mobile number for the selected country.';
  }

  function validate(values) {
    const errors = {};
    if (values.name.trim().length < 2) errors.name = 'Please enter your full name.';
    const mobileError = validateMobile(values);
    if (mobileError) errors.mobile = mobileError;
    if (!values.type) errors.type = 'Please select a participant type.';
    if (!values.district) errors.district = 'Please select your district.';
    const messageLength = values.message.trim().length;
    if (!messageLength) errors.message = 'Please enter your message.';
    else if (messageLength < MESSAGE_MIN)
      errors.message = `Message must be at least ${MESSAGE_MIN} characters (${MESSAGE_MIN - messageLength} more).`;
    else if (messageLength > MESSAGE_MAX) errors.message = `Message can be at most ${MESSAGE_MAX} characters.`;
    return errors;
  }

  const option = (value, label) => {
    const el = document.createElement('option');
    el.value = value;
    el.textContent = label;
    return el;
  };

  function init() {
    const form = $('#join-form');
    if (!form) return;

    const inputs = {
      name: $('#join-name', form),
      country: $('#join-country', form),
      mobile: $('#join-mobile', form),
      type: $('#join-type', form),
      district: $('#join-district', form),
      message: $('#join-message', form),
    };
    const dialLabel = $('.join-code-value', form);
    const counter = $('.join-counter', form);
    const success = $('.join-success', form);
    const successText = $('.join-success-text', form);
    let submitted = false;

    // Fill the country and district lists from js/data
    inputs.country.replaceChildren(...COUNTRY_CODES.map((c) => option(c.iso, `${c.name} (${c.dial})`)));
    inputs.country.value = 'IN';
    AP_DISTRICTS.forEach((district) => inputs.district.append(option(district, district)));

    const values = () => ({
      name: inputs.name.value,
      country: inputs.country.value,
      mobile: inputs.mobile.value,
      type: inputs.type.value,
      district: inputs.district.value,
      message: inputs.message.value,
    });

    function showErrors(errors) {
      FIELDS.forEach((key) => {
        const input = inputs[key];
        const field = input.closest('.join-field');
        const errorEl = $('.join-error', field);
        const hintEl = $('.join-hint', field);
        const message = errors[key] || '';
        field.classList.toggle('has-error', Boolean(message));
        errorEl.textContent = message;
        if (hintEl) hintEl.hidden = Boolean(message);
        input.setAttribute('aria-invalid', String(Boolean(message)));
        const describedBy = message ? errorEl.id : hintEl ? hintEl.id : '';
        if (describedBy) input.setAttribute('aria-describedby', describedBy);
        else input.removeAttribute('aria-describedby');
      });
    }

    function updateDial() {
      dialLabel.textContent = countryByIso(inputs.country.value).dial;
    }

    function updateCounter() {
      counter.textContent = `${inputs.message.value.length}/${MESSAGE_MAX}`;
      counter.classList.toggle('is-ok', inputs.message.value.trim().length >= MESSAGE_MIN);
    }

    // A pasted "+91 98765..." picks that country and keeps only the number
    function normaliseMobile() {
      let raw = inputs.mobile.value.trimStart();
      if (raw.startsWith('+')) {
        const current = countryByIso(inputs.country.value);
        const hit = raw.startsWith(current.dial)
          ? current
          : [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length).find((c) => raw.startsWith(c.dial));
        if (hit) {
          inputs.country.value = hit.iso;
          raw = raw.slice(hit.dial.length);
          updateDial();
        }
      }
      // the number box takes digits, spaces and dashes only
      const cleaned = raw.replace(/[^\d\s-]/g, '').trimStart();
      if (cleaned !== inputs.mobile.value) inputs.mobile.value = cleaned;
    }

    function onChange(key) {
      if (key === 'mobile') normaliseMobile();
      if (key === 'country') updateDial();
      if (key === 'message') {
        if (inputs.message.value.length > MESSAGE_MAX) {
          inputs.message.value = inputs.message.value.slice(0, MESSAGE_MAX);
        }
        updateCounter();
      }
      if (submitted) showErrors(validate(values())); // live feedback once the user has tried to submit
      if (successText.textContent) {
        successText.textContent = '';
        success.classList.remove('is-visible');
      }
    }

    Object.keys(inputs).forEach((key) => {
      const eventName = inputs[key].tagName === 'SELECT' ? 'change' : 'input';
      inputs[key].addEventListener(eventName, () => onChange(key));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const current = values();
      const errors = validate(current);
      submitted = true;
      showErrors(errors);
      const firstInvalid = FIELDS.find((key) => errors[key]);
      if (firstInvalid) {
        inputs[firstInvalid].focus();
        return;
      }
      // No backend yet: send `current` to the API / email service here
      const firstName = current.name.trim().split(/\s+/)[0];
      form.reset();
      inputs.country.value = 'IN';
      updateDial();
      updateCounter();
      submitted = false;
      showErrors({});
      successText.textContent = `Thank you, ${firstName}! Our team will get in touch with you soon.`;
      success.classList.add('is-visible');
    });

    $$('.join-error', form).forEach((el) => {
      el.textContent = '';
    });
    updateDial();
    updateCounter();
  }

  SafeMission.components = SafeMission.components || {};
  SafeMission.components.joinForm = { init };
})(window.SafeMission = window.SafeMission || {});
