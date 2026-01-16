// export type FormItem =
//   | {
//       kind: 'text' | 'input_date' | 'input_time';
//       title: string;
//       value: string;
//       id: number;
//     }
//   | {
//       kind: 'select';
//       title: string;
//       options: string[];
//       value: string;
//       id: number;
//     }
//   | {
//       kind: 'check_boxes';
//       title: string;
//       id: number;
//       check_boxes: {
//         label: string;
//         value: boolean;
//         id: number;
//       }[];
//     };

export type FormConfig = {
  name: string,
  description: string,
  in_charge: string,
  weather: boolean,
  location: boolean
}

export type FormItem = {
  kind: 'text' | 'input_date' | 'input_time' | 'select' | 'check_boxes' | 'weather' | 'location';
  title: string;
  value: string;
  id: number;
  options: string[] | undefined;
  check_boxes: {
    label: string;
    value: boolean;
    id: number;
  }[] | undefined;
  coords : {
    latitude: string
    longitude: string
  }
}

export type Form = {
  questions?: FormItem[],
  id?: number,
  status?: string,
  config: FormConfig
};
