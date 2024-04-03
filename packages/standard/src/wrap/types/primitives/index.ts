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

/**
 * Creates a new Bool.
 *
 * @example
 *
 * const MyBool = new Bool(true)
 *
 */
export const Bool =  Bool_<Std>
export type Bool =  Bool_<Std>

/**
 * Creates a new Byte.
 *
 * Min: 0 - Max: 255
 *
 * @example
 * const MyByte = new Byte(255)
 * const MyByte = new Byte(0xFF)
 * const MyByte = new Byte(0b100001)
 *
 */
export const Byte = Byte_<Std>
export type Byte = Byte_<Std>

/**
 * Creates a new Word.
 *
 * Min: 0 - Max: 65535
 *
 * @example
 * const MyWord = new Word(65535)
 * const MyWord = new Word(0xFFFF)
 * const MyWord = new Word(0b11010)
 *
 */
export const Word = Word_<Std>
export type Word = Word_<Std>

/**
 * Creates a new DWord.
 *
 * Min: 0 - Max: 4_294_967_295
 *
 * @example
 * const MyDWord = new DWord(4_294_967_295)
 * const MyDWord = new DWord(0xFFFFFFFF)
 * const MyDWord = new DWord(0b100001)
 *
 */
export const DWord = DWord_<Std>
export type DWord = DWord_<Std>

/**
 * Creates a new LWord.
 *
 * Min: 0 - Max: 18_446_744_073_709_551_615
 *
 * @example
 * const MyLWord = new LWord(18_446_744_073_709_551_615n)
 * const MyLWord = new LWord(0xFFFFFFFFFFFFFFFF)
 * const MyLWord = new LWord(0b10010101)
 *
 */
export const LWord = LWord_<Std>
export type LWord = LWord_<Std>

/**
 * Creates a new USInt.
 *
 * Min: 0 - Max: 255
 *
 * @example
 * const MyUSInt = new USInt(255)
 *
 */
export const USInt = USInt_<Std>
export type USInt = USInt_<Std>

/**
 * Creates a new SInt.
 *
 * Min: -128 - Max: 127
 *
 * @example
 * const MySInt = new SInt(127);
 * const MyNegativeSInt = new SInt(-128);
 *
 */
export const SInt = SInt_<Std>
export type SInt = SInt_<Std>

/**
 * Creates a new Int.
 *
 * Min: -32_768 - Max: 32_767
 *
 * @example
 * const MyInt = new Int(32_767)
 * const MyNegativeInt = new Int(-32_768)
 *
 */
export const Int = Int_<Std>
export type Int = Int_<Std>

/**
 * Creates a new UInt.
 *
 * Min: 0 - Max: 65_535
 *
 * @example
 * const MyUInt = new UInt(65_535);
 *
 */
export const UInt = UInt_<Std>
export type UInt = UInt_<Std>

/**
 * Creates a new UDInt.
 *
 * Min: 0 - Max: 4_294_967_295
 *
 * @example
 * const MyUDInt = new UDInt(4_294_967_295);
 *
 */
export const UDInt = UDInt_<Std>
export type UDInt = UDInt_<Std>

/**
 * Creates a new DInt.
 *
 * Min: -2_147_483_648 - Max: 2_147_483_647
 *
 * @example
 * const MyDInt = new DInt(2_147_483_647)
 * const MyNegativeDInt = new DInt(-2_147_483_648)
 *
 */
export const DInt = DInt_<Std> 
export type DInt = DInt_<Std>

/**
 * Creates a new ULInt.
 *
 * Min: 0 - Max: 18_446_744_073_709_551_615n
 *
 * @example
 * const MyULInt = new ULInt(18446744073709551615n)
 *
 */
export const ULInt = ULInt_<Std>
export type ULInt = ULInt_<Std>

/**
 * Creates a new LInt.
 *
 * Min: -9_223_372_036_854_775_808n - Max: 9_223_372_036_854_775_807n
 *
 * @example
 * const MyLInt = new LInt(9_223_372_036_854_775_807)
 * const MyNegativeLInt = new LInt(-9_223_372_036_854_775_808)
 *
 */
export const LInt = LInt_<Std>
export type LInt = LInt_<Std>
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

export const LTime = LTime_<Std>
export type LTime = LTime_<Std>

export const LTime_from: typeof LTime_from_<Std> = LTime_from_<Std>

export const Tod = Tod_<Std>
export type Tod = Tod_<Std>

export const Tod_from: typeof Tod_from_<Std> = Tod_from_<Std>

export const LTod = LTod_<Std>
export type LTod = LTod_<Std>

export const LTod_from: typeof LTod_from_<Std> = LTod_from_<Std>
