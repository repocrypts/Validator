export default class Replacers {
    static replaceMin(msg, attr, rule, params) {
      return msg.replace(':min', params[0])
    }
}