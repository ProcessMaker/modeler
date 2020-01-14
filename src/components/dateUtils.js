/* global ProcessMaker*/
import moment from 'moment-timezone';

function getProcessMakerUserValue(key) {
  if (typeof ProcessMaker !== 'undefined' && ProcessMaker.user) {
    return ProcessMaker.user[key];
  }
}

export function getTimezone() {
  return getProcessMakerUserValue('timezone') || moment.tz.guess();
}

export function getLang() {
  return getProcessMakerUserValue('lang') || 'en';
}

export function getUserDateFormat() {
  if (typeof ProcessMaker !== 'undefined' && ProcessMaker.user) {
    return ProcessMaker.user.datetime_format.replace(/[\sHh:msaAzZ]/g, '');
  }

  return 'MM/DD/YYYY';
}

export function getUserDateTimeFormat() {
  return getProcessMakerUserValue('datetime_format') || 'MM/DD/YYYY h:mm A';
}

export function isValidDate(date, format = getUserDateFormat()) {
  return moment(date, format).isValid();
}
