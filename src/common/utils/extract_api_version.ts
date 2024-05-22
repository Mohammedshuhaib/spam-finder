// import { FastifyRequest } from 'fastify/fastify';
import { version_code_list } from './version_list';

export const DEFAULT_VERSION = version_code_list[version_code_list.length - 1];

export const extract_api_version = (request: any): string | string[] => {
  const requestVersion =
    <string>request.headers['x-api-version'] ?? DEFAULT_VERSION;
  let v = [];
  if (version_code_list.includes(requestVersion)) {
    for (let i = 0; i < version_code_list.length - 1; i++) {
      if (version_code_list[i] !== requestVersion) {
        v.push(version_code_list[i]);
      } else {
        break;
      }
    }
    v.push(requestVersion);
    v = v.reverse();
    return v;
  }

  return DEFAULT_VERSION;
};
