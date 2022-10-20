const log = process.env.NODE_ENV === 'LOGGER' ? console.log : () => {};

export default log;