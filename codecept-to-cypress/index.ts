#! /usr/bin/env ts-node
import Converter from "./Converter";

if (!process.argv[2]) {
    throw new Error('Provide a path to test to convert.');
}

new Converter(process.argv[2]);