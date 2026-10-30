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
const form = document.querySelector('#quote-form');
if (form) form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const fields = [['Name', 'name'], ['Company', 'company'], ['Email', 'email'], ['Phone', 'phone'], ['Inquiry type', 'service'], ['Pickup location', 'origin'], ['Delivery location', 'destination']];
  const lines = ['MARNE LOGISTICS LLC — INQUIRY BRIEF', '', 'This file has not been sent. It is not a quote, booking or transport agreement.', 'Share it with your verified company contact when available.', ''];
  fields.forEach(([label, key]) => { const value = String(data.get(key) || '').trim(); if (value) lines.push(`${label}: ${value}`); });
  lines.push('', 'Message / shipment details:', String(data.get('details') || '').trim());
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' }));
  const download = document.createElement('a'); download.href = url; download.download = 'marne-logistics-inquiry.txt'; document.body.append(download); download.click(); download.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  const status = form.querySelector('.form-status'); if (status) status.textContent = 'Your inquiry file is ready. Nothing has been sent online; share it with your verified company contact.';
});
document.querySelectorAll('#year').forEach(el => { el.textContent = new Date().getFullYear(); });
