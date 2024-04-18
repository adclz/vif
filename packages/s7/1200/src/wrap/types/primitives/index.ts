import {
    Bool as Bool_,
    Byte as Byte_,
    Word as Word_,
    DWord as DWord_,
    LWord as LWord_,

    USInt as USInt_,
    SInt as SInt_,

    Int as Int_,
    UInt as UInt_,

    UDInt as UDInt_,
    DInt as DInt_,

    ULInt as ULInt_,
    LInt as LInt_,

    Real as Real_,
    LReal as LReal_,
    
    String as String_,
    WString as WString_,

    Char as Char_,
    WChar as WChar_,

    Time as Time_,
    Time_from as Time_from_,

    LTime as LTime_,
    LTime_from as LTime_from_,
    
    Tod as Tod_,
    Tod_from as Tod_from_,
    
    LTod as LTod_,
    LTod_from as LTod_from_,

} from '@vifjs/language-builder/types/primitives'


export interface Std {}

export const Bool =  Bool_<Std>
export type Bool =  Bool_<Std>
export const Byte = Byte_<Std>
export type Byte = Byte_<Std>
export const Word = Word_<Std>
export type Word = Word_<Std>
export const DWord = DWord_<Std>
export type DWord = DWord_<Std>
export const USInt = USInt_<Std>
export type USInt = USInt_<Std>
export const SInt = SInt_<Std>
export type SInt = SInt_<Std>
export const Int = Int_<Std>
export type Int = Int_<Std>
export const UInt = UInt_<Std>
export type UInt = UInt_<Std>
export const UDInt = UDInt_<Std>
export type UDInt = UDInt_<Std>
export const DInt = DInt_<Std> 
export type DInt = DInt_<Std>

export const Real = Real_<Std> 
export type Real = Real_<Std>

export const LReal = LReal_<Std>
export type LReal = LReal_<Std>
export const String = String_<Std>
export type String = String_<Std>
export const WString = WString_<Std>
export type WString = WString_<Std>
export const Char = Char_<Std>
export type Char = Char_<Std>
export const WChar = WChar_<Std>
export type WChar = WChar_<Std>
export const Time = Time_<Std>
export type Time = Time_<Std>

export const Time_from: typeof Time_from_<Std> = Time_from_<Std>

export const Tod = Tod_<Std>
export type Tod = Tod_<Std>

export const Tod_from: typeof Tod_from_<Std> = Tod_from_<Std>
