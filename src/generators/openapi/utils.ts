import { VALID_TYPES } from '../../utils/genericUtils';
import Logger from '@novice1/logger';
import { OpenAPISupportedVersion } from './definitions';

export const Log = Logger.debugger('@novice1/api-doc-generator').extend('openapi');

export function _formatType(type: string): { type?: string, format?: string } {
  let t: { type?: string, format?: string } = {
    type,
  };
  if (type === 'uuid' || type === 'guid') {
    t.type = 'string';
    t.format = 'uuid';
    Log.silly('type %s to %o', type, t);
  }
  else if (type === 'date-time' || type === 'datetime') {
    t.type = 'string';
    t.format = 'date-time';
    Log.silly('type %s to %o', type, t);
  }
  else if (type === 'password'
    || type === 'email'
    || type === 'uri'
    || type === 'url'
    || type === 'date'
    || type === 'byte'
    || type === 'binary') {
    t.type = 'string';
    t.format = type;
    Log.silly('type %s to %o', type, t);
  }
  else if (type === 'float' || type === 'double') {
    t.type = 'number'
    t.format = type;
    Log.silly('type %s to %o', type, t);
  } else if (type === 'int32' || type === 'int64') {
    t.type = 'integer'
    t.format = type;
    Log.silly('type %s to %o', type, t);
  }
  else if (!VALID_TYPES.includes(type)) {
    t = {};
    Log.silly('type %s to %o', type, t);
  }

  return t;
}

export function formatType3_0(type: string): { type?: string, format?: string } {
  let t: { type?: string, format?: string } = {
    type,
  };
  if (type === 'binary') {
    t.type = 'string';
    t.format = type;
    Log.silly('type %s to %o', type, t);
  } else {
    t = _formatType(type)
  }

  return t;
}

// @TODO: better handling for contentMediaType and contentEncoding. For now, format=binary still works in some editors (editor-next.swagger.io)
export function formatType3_1(type: string): { type?: string, format?: string, contentMediaType?: string, contentEncoding?: string } {
  let t: { type?: string, format?: string, contentMediaType?: string, contentEncoding?: string } = {
    type,
  };
  if (type === 'binary') {
    t.type = 'string';
    t.format = 'binary';
    t.contentMediaType = 'application/octet-stream';
  } else if (type.includes('/')) {
    t.type = 'string';
    t.contentMediaType = type;
    Log.silly('type %s to %o', type, t);
  } else {
    t = _formatType(type)
  }

  return t;
}

export function formatType(type: string, v?: OpenAPISupportedVersion): { type?: string, format?: string, contentMediaType?: string, contentEncoding?: string } {
  if (v === '3.0.4') {
    return formatType3_0(type)
  } else {
    return formatType3_1(type)
  }
}

export function formatPath(path: string, params?: Record<string, unknown>): string {
  if (params) {
    let pos: number = path.indexOf('/:');

    // found express parameters notation
    if (pos > -1) {
      let pathEnd: string = path;
      path = '';

      while (pos > -1) {
        const fromParamPath: string = pathEnd.substring(pos + 2);
        const endPos: number = fromParamPath.indexOf('/');

        // path param name
        let variableName = fromParamPath;
        if (endPos > -1) {
          variableName = fromParamPath.substring(0, endPos);
        }

        // if * after var name
        if (variableName.endsWith('*')) {
          variableName = variableName.substring(0, variableName.length - 1)
        }

        path += pathEnd.substring(0, pos + 1);

        // if path param name is found in route meta parameters
        if (params[variableName]) {
          path += '{' + variableName + '}';
        } else {
          path += ':' + variableName;
        }

        if (endPos > -1) {
          pathEnd = fromParamPath.substring(endPos);
        } else {
          pathEnd = '';
        }
        pos = pathEnd.indexOf('/:');
      }
      path += pathEnd;
    }
  }
  return path;
}
