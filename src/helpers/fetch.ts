import fetch from 'node-fetch';
import fetchMocksList from './fetch.mocks.list';
import log from './logger';

export const fetchQuery = async(url: string, postData?: any) => {
  const testUrl = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(url);
  
  if (!testUrl) throw new Error('url malformed');

  const opts: any = {};
  log('fetchQuery', url);

  // a dirty hack to mock fetch requests
  if (process.env.NODE_ENV === 'JEST' && fetchMocksList.hasOwnProperty(url)) {
    log('JEST fetch load from cache', url);
    return fetchMocksList[url];
  }

  if (postData) {
    opts.body = JSON.stringify(postData);
    opts.headers = new fetch.Headers();
    opts.headers.append('Content-Type', 'application/json');
    opts.headers.append('Content-Length', opts.body.length);
    opts.method = 'POST';
  }

  const response = await fetch(url, opts);
  const isJson = response.headers.get('Content-Type').includes('application/json');

  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    //throw new Error(body);
    log({err: body});
  }

  return body;
};