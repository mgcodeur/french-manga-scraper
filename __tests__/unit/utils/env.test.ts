import { MissingEnvVariableException } from '@/core/exceptions/MissingEnvVariableException';
import { env } from '@/core/utils/env';

describe('env()', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return the value of the environment variable if it exists', () => {
    process.env.TEST_VAR = 'testValue';
    expect(env('TEST_VAR')).toBe('testValue');
  });

  it('should return the default value if the environment variable does not exist', () => {
    expect(env('NON_EXISTENT_VAR', 'defaultValue')).toBe('defaultValue');
  });

  it('should throw an error if the environment variable does not exist and no default value is provided', () => {
    expect(() => env('NON_EXISTENT_VAR')).toThrow(MissingEnvVariableException);
  });
});
