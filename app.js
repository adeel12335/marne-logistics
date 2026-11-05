'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { if (!navigation || !menuButton) return; navigation.classList.remove('open'); document.body.classList.remove('mobile-menu-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
if (menuButton && navigation) {
  menuButton.addEventListener('click', () => { const open = navigation.classList.toggle('open'); document.body.classList.toggle('mobile-menu-open', open); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (navigation.classList.contains('open') && !event.target.closest('.header')) closeMenu(); });
  window.matchMedia('(max-width: 1024px)').addEventListener('change', closeMenu);
  window.addEventListener('pagehide', closeMenu);
}
const service = document.querySelector('#service');
const params = new URLSearchParams(location.search);
const topicMap = { broker: 'Broker inquiry', driver: 'Driver opportunity', carrier: 'Carrier Partnership' };
const requested = params.get('service') || topicMap[params.get('topic')];
if (service && requested && [...service.options].some(option => option.value === requested)) service.value = requested;
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => { if (service) service.value = link.dataset.service; }));
const inquiryInbox = '';
const inquirySuccess = 'Thank you for contacting Marne Logistics. Your inquiry has been received. A member of our team will review your request and follow up using the contact information provided.';
const form = document.querySelector('#quote-form');
function setFormStatus(target, message, kind) {
  const status = target.querySelector('.form-status');
  if (!status) return;
  status.textContent = message;
  status.classList.remove('is-error', 'is-success');
  if (kind) status.classList.add(kind);
}
if (form) form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const honeypot = form.querySelector('[name="company_website"]');
  if (honeypot && honeypot.value.trim()) {
    setFormStatus(form, 'This inquiry could not be sent. Please try again.', 'is-error');
    return;
  }
  if (!inquiryInbox) {
    setFormStatus(form, 'This inquiry could not be sent because the company inbox is not connected yet. Nothing was received.', 'is-error');
    return;
  }
  const data = new FormData(form);
  const fields = [['Name', 'name'], ['Company', 'company'], ['Email', 'email'], ['Phone', 'phone'], ['Inquiry type', 'service'], ['Pickup', 'origin'], ['Delivery', 'destination'], ['Commodity', 'commodity'], ['Temperature', 'temperature'], ['Details', 'details']];
  const lines = [`Submitted: ${new Date().toISOString()}`];
  fields.forEach(([label, key]) => { const value = String(data.get(key) || '').trim(); if (value) lines.push(`${label}: ${value}`); });
  const button = form.querySelector('[type="submit"]');
  if (button) button.disabled = true;
  setFormStatus(form, 'Sending your inquiry…', '');
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inquiryInbox)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: String(data.get('name') || data.get('company') || 'Website inquiry').trim(),
        email: String(data.get('email') || '').trim(),
        _replyto: String(data.get('email') || '').trim(),
        _subject: `Marne Logistics inquiry — ${String(data.get('service') || 'General').trim()}`,
        _template: 'table',
        _captcha: 'false',
        message: lines.join('\n')
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || String(payload.success) !== 'true') throw new Error('send failed');
    form.reset();
    setFormStatus(form, inquirySuccess, 'is-success');
  } catch (error) {
    setFormStatus(form, 'Your inquiry was not sent. Please try again. Marne Logistics has not received this message.', 'is-error');
  } finally {
    if (button) button.disabled = false;
  }
});
document.querySelectorAll('#year').forEach(el => { el.textContent = new Date().getFullYear(); });
