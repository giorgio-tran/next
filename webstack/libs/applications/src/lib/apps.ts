/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

import { name as CounterName, init as defaultCounter } from './CounterApp';
import { name as ImageName, init as defaultImage } from './ImageApp';
import { name as LinkerName, init as defaultLinker } from './LinkerApp';
import { name as NoteName, init as defaultNote } from './NoteApp';
import { name as SliderName, init as defaultSlider } from './SliderApp';

import CounterApp from './CounterApp/CounterApp';
import ImageApp from './ImageApp/ImageApp';
import LinkerApp from './LinkerApp/LinkerApp';
import NoteApp from './NoteApp/NoteApp';
import SliderApp from './SliderApp/SliderApp';

export const Applications = {
  [CounterName]: CounterApp,
  [ImageName]: ImageApp,
  [LinkerName]: LinkerApp,
  [NoteName]: NoteApp,
  [SliderName]: SliderApp,
} as unknown as Record<string, () => JSX.Element>;

export const initialValues = {
  [CounterName]: defaultCounter,
  [ImageName]: defaultImage,
  [LinkerName]: defaultLinker,
  [NoteName]: defaultNote,
  [SliderName]: defaultSlider,
};
