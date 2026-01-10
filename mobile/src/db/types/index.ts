export type BaseChange = {
  status: 'created' | 'updated';
  changed: string | '';
};

export type ChangesSchema<Key extends string, Data extends BaseChange> = {
  [P in Key]: {
    created: Data[];
    updated: Data[];
    deleted: string[];
  };
};
