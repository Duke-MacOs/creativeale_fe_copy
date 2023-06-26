import { useCurrent } from '@editor/Editor/Property/cells';
import { useEffect, MutableRefObject } from 'react';

type Provider = {
  get(): RikoScript | undefined;
  del(): boolean;
  set(getEvent: () => Promise<RikoScript>, fallback?: boolean): Promise<boolean>;
};

const PROVIDERS: MutableRefObject<Provider>[] = [];

export const useProvideEvent = (selected: number, events: RikoScript[], onChange: (events: RikoScript[]) => void) => {
  const provider = useCurrent<Provider>({
    get() {
      for (const [scripts] of getEvents(events, onChange)) {
        const result = scripts.find(({ id }) => id === selected);
        if (result) {
          return result;
        }
      }
    },
    async set(getEvent, fallback = false) {
      if (fallback) {
        onChange(events.concat(await getEvent()));
        return true;
      }
      for (const [scripts, onChangeScripts] of getEvents(events, onChange)) {
        const index = scripts.findIndex(({ id }) => id === selected) + 1;
        if (index > 0) {
          onChangeScripts([...scripts.slice(0, index), await getEvent(), ...scripts.slice(index)]);
          return true;
        }
      }
      return false;
    },
    del() {
      for (const [scripts, onChangeScripts] of getEvents(events, onChange)) {
        if (scripts.some(({ id }) => id === selected)) {
          onChangeScripts(scripts.filter(({ id }) => id !== selected));
          return true;
        }
      }
      return false;
    },
  });
  useEffect(() => {
    PROVIDERS.push(provider);
    return () => {
      PROVIDERS.splice(
        PROVIDERS.findIndex(p => p === provider),
        1
      );
    };
  }, [provider]);
};

export const consumeEvent = (): Provider => {
  return {
    get() {
      for (let i = PROVIDERS.length - 1; i > -1; i--) {
        const result = PROVIDERS[i].current.get();
        if (result) {
          return result;
        }
      }
    },
    del() {
      for (let i = PROVIDERS.length - 1; i > -1; i--) {
        if (PROVIDERS[i].current.del()) {
          return true;
        }
      }
      return false;
    },
    async set(getEvent) {
      for (let i = PROVIDERS.length - 1; i > -1; i--) {
        if (await PROVIDERS[i].current.set(getEvent)) {
          return true;
        }
      }
      if (PROVIDERS.length > 0) {
        await PROVIDERS[0].current.set(getEvent, true);
      }
      return false;
    },
  };
};

function* getEvents(
  events: RikoScript[],
  onChange: (events: RikoScript[]) => void
): Generator<[RikoScript[], (events: RikoScript[]) => void]> {
  yield [events, onChange];
  for (let i = 0; i < events.length; i++) {
    for (const key of ['scripts', 'elseScripts'] as const) {
      const { [key]: scripts = [] } = events[i].props;
      yield* getEvents(scripts, scripts => {
        const newEvents = events.slice();
        newEvents[i] = { ...events[i], props: { ...events[i].props, [key]: scripts } };
        onChange(newEvents);
      });
    }
  }
}
