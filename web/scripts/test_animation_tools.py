"""Offline regression checks for publication of malformed rig output."""
import tempfile
import unittest
from pathlib import Path
from PIL import Image, ImageDraw
from animation_tools import bake, extract, swing

class AnimationToolsTest(unittest.TestCase):
    def test_contact_tangents(self):
        for stance,stride in ((.6,48),(.75,28)):
            eps = 1e-5
            for phase in (stance,1):
                before = swing(phase-eps,0,stride,stance,8)
                after = swing((phase+eps)%1,0,stride,stance,8)
                self.assertAlmostEqual((after[0]-before[0])/(2*eps),stride,delta=.02)
                self.assertAlmostEqual((after[1]-before[1])/(2*eps),0,delta=.02)
    def test_wrong_component_count_rejected(self):
        with self.assertRaises(ValueError):extract(Image.new("RGBA",(32,32)),5)
    def test_incomplete_or_clipped_frames_never_publish(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            good=Image.new("RGBA",(20,20));ImageDraw.Draw(good).rectangle((4,4,12,16),fill="white")
            bad=Image.new("RGBA",(20,20),"white")
            for frames,sequences in (([],{}),([good],{"walk":[0,2]}),([bad],{"walk":[0,1]}),([good],{"walk":[1,1]})):
                with self.assertRaises(ValueError):bake(root,"test",frames,(20,20),17,sequences,[],{})
                self.assertFalse((root/"public/art/expedition/test-animation.webp").exists())
    def test_grounding_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            frame=Image.new("RGBA",(20,20));ImageDraw.Draw(frame).rectangle((4,4,12,10),fill="white")
            with self.assertRaisesRegex(ValueError,"grounding"):bake(Path(directory),"test",[frame],(20,20),17,{"walk":[0,1]},[],{})

if __name__ == "__main__":unittest.main()
