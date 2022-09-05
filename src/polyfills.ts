// Workaround: https://github.com/graphql/graphql-js/issues/1536
import * as process from 'process';
window['process'] = process;
export {};
