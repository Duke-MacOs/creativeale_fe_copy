import { IEffectConfig } from '../';
import inAndOutEffect from './inAndOut';
import maskEffect from './mask';
import loopEffect from './loop';
import commonEffect from './common';

export default Object.assign({} as IEffectConfig, inAndOutEffect, maskEffect, loopEffect, commonEffect);
