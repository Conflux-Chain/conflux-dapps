import React from 'react';

const MathTex: React.FC<{ className?: string; type?: 'reward' | 'rate' }> = ({ className, type = 'rate' }) => {
    return (
        <math className={className}>
            <mrow>
                <mi mathvariant="normal">p</mi>
                <mi mathvariant="normal">r</mi>
                <mi mathvariant="normal">e</mi>
                <mi mathvariant="normal">v</mi>
                <mi mathvariant="normal">i</mi>
                <mi mathvariant="normal">o</mi>
                <mi mathvariant="normal">u</mi>
                <mi mathvariant="normal">s</mi>
                {type === 'rate' && (
                    <>
                        <mi mathvariant="normal">R</mi>
                        <mi mathvariant="normal">a</mi>
                        <mi mathvariant="normal">t</mi>
                        <mi mathvariant="normal">e</mi>
                    </>
                )}
                {type === 'reward' && (
                    <>
                        <mi mathvariant="normal">R</mi>
                        <mi mathvariant="normal">e</mi>
                        <mi mathvariant="normal">w</mi>
                        <mi mathvariant="normal">a</mi>
                        <mi mathvariant="normal">r</mi>
                        <mi mathvariant="normal">d</mi>
                    </>
                )}
                <mo>×</mo>
                <msup>
                    <mn>2</mn>
                    <mfrac>
                        <mrow>
                            <mi mathvariant="normal">i</mi>
                            <mi mathvariant="normal">n</mi>
                            <mi mathvariant="normal">c</mi>
                            <mi mathvariant="normal">r</mi>
                            <mi mathvariant="normal">e</mi>
                            <mi mathvariant="normal">a</mi>
                            <mi mathvariant="normal">s</mi>
                            <mi mathvariant="normal">e</mi>
                            <mo>−</mo>
                            <mi mathvariant="normal">d</mi>
                            <mi mathvariant="normal">e</mi>
                            <mi mathvariant="normal">c</mi>
                            <mi mathvariant="normal">r</mi>
                            <mi mathvariant="normal">e</mi>
                            <mi mathvariant="normal">a</mi>
                            <mi mathvariant="normal">s</mi>
                            <mi mathvariant="normal">e</mi>
                        </mrow>
                        <mrow>
                            <mi mathvariant="normal">i</mi>
                            <mi mathvariant="normal">n</mi>
                            <mi mathvariant="normal">c</mi>
                            <mi mathvariant="normal">r</mi>
                            <mi mathvariant="normal">e</mi>
                            <mi mathvariant="normal">a</mi>
                            <mi mathvariant="normal">s</mi>
                            <mi mathvariant="normal">e</mi>
                            <mo>+</mo>
                            <mi mathvariant="normal">d</mi>
                            <mi mathvariant="normal">e</mi>
                            <mi mathvariant="normal">c</mi>
                            <mi mathvariant="normal">r</mi>
                            <mi mathvariant="normal">e</mi>
                            <mi mathvariant="normal">a</mi>
                            <mi mathvariant="normal">s</mi>
                            <mi mathvariant="normal">e</mi>
                            <mo>+</mo>
                            <mi mathvariant="normal">u</mi>
                            <mi mathvariant="normal">n</mi>
                            <mi mathvariant="normal">c</mi>
                            <mi mathvariant="normal">h</mi>
                            <mi mathvariant="normal">a</mi>
                            <mi mathvariant="normal">n</mi>
                            <mi mathvariant="normal">g</mi>
                            <mi mathvariant="normal">e</mi>
                        </mrow>
                    </mfrac>
                </msup>
            </mrow>
        </math>
    );
};

export default MathTex;
