function convertToBRLYT(xmlDocument) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDocument)
  }




const types = {
    'u8': 'B',
    'u16': 'H',
    'u32': 'I',
    'u64': 'Q',
    's8': 'b',
    's16': 'h',
    's32': 'i',
    's64': 'q',
    'float': 'f',
    'f32': 'f',
    'double': 'd',
    'f64': 'd',
    'bool': 'c',
    'char': 'c',
  };
  
  function parseVar(pos, type, chunk) {
    if (!types[type]) {
      throw new Error(`What's a ${type}?`);
    }
  
    const format = `>${types[type]}`;
    const size = structSize(format);
  
    return [pos + size, structUnpack(format, chunk.slice(pos, pos + size))];
  }
  
  function unparseVar(type, variable) {
    if (!types[type]) {
      throw new Error(`What's a ${type}?`);
    }
  
    return structPack(`>${types[type]}`, variable);
  }
  
  function structSize(format) {
    return struct.calcSize(format);
  }
  
  function structPack(format, ...args) {
    return struct.pack(format, ...args);
  }
  
  function structUnpack(format, data) {
    return struct.unpack(format, data)[0];
  }
  
  function parseData(chunk, definition, prefix = null, start = 0) {
    const [df, etc, etcn] = formats[definition];
    let pos = start;
    const ret = {};
  
    for (const [type, name, _] of df) {
      let size = null;
      try {
        [name, size] = name;
      } catch {
        // Do nothing
      }
  
      if (prefix !== null) {
        name = `${prefix}.${name}`;
      }
  
      let variable;
      if (size === null) {
        [pos, variable] = parseVar(pos, type, chunk);
      } else {
        if (type === 'char') {
          variable = chunk.slice(pos, pos + size).toString().replace(/\0+$/, '');
          pos += size;
        } else {
          variable = [];
          for (let i = 0; i < size; i++) {
            [pos, variable[i]] = parseVar(pos, type, chunk);
          }
        }
      }
  
      if (ret[name] !== undefined) {
        try {
          ret[name].push(variable);
        } catch {
          ret[name] = [ret[name], variable];
        }
      } else {
        ret[name] = variable;
      }
    }
  
    if (pos > chunk.length) {
      throw new Error('Too much!');
    }
  
    if (pos < chunk.length) {
      if (etc && !etcn) {
        ret.etc = chunk.slice(pos).toString('utf-8');
      } else if (!etc) {
        throw new Error('Incomplete handling...');
      }
    }
  
    if (prefix !== null) {
      const ret2 = {};
      for (const [k, v] of Object.entries(ret)) {
        ret2[`${prefix}.${k}`] = v;
      }
      return etcn ? [ret2, pos] : ret2;
    }
  
    if (etcn) {
      return [ret, pos];
    }
  
    return ret;
  }
  
  function unparseData(vars, definition, prefix = null) {
    const [df, etc] = formats[definition];
    let ret = '';
  
    if (df.length === 1) {
      try {
        assert(df[0][1] === '_' || df[0][1][0] === '_');
      } catch {
        // Do nothing
      } finally {
        vars = { '_': vars };
      }
    }
  
    for (const [type, name, defaultValue] of df) {
      let size = null;
      try {
        [name, size] = name;
      } catch {
        // Do nothing
      }
  
      if (prefix !== null) {
        name = `${prefix}.${name}`;
      }
  
      let variable;
      try {
        variable = vars[name];
      } catch {
        if (defaultValue === null) {
          throw new Error();
        } else {
          variable = defaultValue;
        }
      }
  
      if (size === null) {
        ret += unparseVar(type, variable);
      } else {
        if (type === 'char') {
          ret += variable.padEnd(size, '\0');
        } else {
          assert(variable.length === size);
          for (const v of variable) {
            ret += unparseVar(type, v);
          }
        }
      }
    }
  
    return ret;
  }
  
  function iffToChunks(z) {
    let pos = 0;
    const chunks = [];
  
    while (pos < z.length) {
      const cc = z.slice(pos, pos + 4);
      const length = structUnpack('>I', z.slice(pos + 4, pos + 8));
      const data = z.slice(pos + 8, pos + length);
      pos += length;
  
      chunks.push([cc, data]);
    }
  
    return chunks;
  }
  
  function bitExtract(num, start, end = null) {
    if (end === null) {
      end = start;
    }
  
    const mask = (2 ** (31 - start + 1) - 1) - (2 ** (31 - end) - 1);
    return (num & mask) >> (31 - end);
  }
  
  function bitPlace(num, start, end = null) {
    if (end === null) {
      end = start;
    }
  
    assert(num <= 2 ** (end - start));
    return num << (31 - end);
  }
  
  function getArray(chunk, startpos, arraySize, itemSize, itemType = null) {
    const ar = [];
    let pos = startpos;
  
    for (let n = 0; n < arraySize; n++) {
      const [item, newPos] = getOpt(chunk, pos, true, itemSize, itemType);
      ar.push(item);
      pos = newPos;
    }
  
    return [ar, pos];
  }
  
  function getOpt(chunk, startpos, enabled, size, itemType = null) {
    if (!enabled) {
      return [null, startpos];
    } else if (itemType !== null) {
      const ret = parseData(chunk.slice(startpos, startpos + size), itemType);
      return [ret, startpos + size];
    } else if (size === 4) {
      const ret = structUnpack('>I', chunk.slice(startpos, startpos + 4));
      return [ret, startpos + size];
    } else if (size % 4 === 0) {
      const ret = structUnpack('>' + 'I'.repeat(size / 4), chunk.slice(startpos, startpos + size));
      return [ret, startpos + size];
    } else {
      throw new Error('Unhandled');
    }
  }
  
  function putArray(variable, flags, start, end, itemSize, itemType = null) {
    let ret = '';
  
    for (const el of variable) {
      const [dat, _] = putOpt(el, flags, 0, itemSize, itemType);
      ret += dat;
    }
  
    flags |= bitPlace(variable.length, start, end);
    return [ret, flags];
  }
  
  function putOpt(variable, flags, bit, size, itemType = null) {
    if (variable === null) {
      return ['', flags];
    }
  
    flags |= bitPlace(1, bit);
  
    if (itemType !== null) {
      const ret = unparseData(variable, itemType);
      return [ret, flags];
    } else if (size === 4) {
      const ret = structPack('>I', variable);
      return [ret, flags];
    } else if (size % 4 === 0) {
      const ret = structPack('>' + 'I'.repeat(size / 4), ...variable);
      return [ret, flags];
    } else {
      throw new Error('Unhandled');
    }
  }
  
  function i2f(int) {
    return structUnpack('>f', structPack('>I', int));
  }

  

// i give up if someone wants to explain to me how brlyt works or better yet help me write out the rest of the translation feel free 






  