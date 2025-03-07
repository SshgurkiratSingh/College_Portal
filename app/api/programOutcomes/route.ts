import { NextResponse } from 'next/server';

export async function GET() {
  // Program Outcomes data
  const programOutcomes = {
    "PO1": "Graduates will demonstrate basic knowledge in Mathematics, Science, and Engineering and the ability to solve complex problems.",
    "PO2": "Graduates will demonstrate an ability to identify and analyze fundamental problems in Mathematics, Science, and Engineering.",
    "PO3": "The ability to innovate and design an Electronics or Communication system that meets desired specifications and requirements.",
    "PO4": "Ability to analyze and interpret data using various research methodologies to solve Electronics or Communication Engineering problems and provide significant conclusions.",
    "PO5": "Graduates will be familiar with modern engineering software tools for analyzing multidisciplinary engineering problems and their limitations.",
    "PO6": "Develop confidence to apply engineering solutions in a global and societal context.",
    "PO7": "Ability to understand and demonstrate the impact of Engineering and technological solutions for sustainable development of society and environment.",
    "PO8": "Inculcate the understanding of professional and ethical responsibilities.",
    "PO9": "Demonstrate an ability to understand individual roles and leadership qualities to lead diverse groups in multidisciplinary fields.",
    "PO10": "Cultivate the ability to communicate effectively in both verbal and written forms among peers and society.",
    "PO11": "Graduates will possess leadership and managerial skills with professional, economic, and ethical concerns for managing teams or as individuals in multidisciplinary environments.",
    "PO12": "Capable of self-education and clearly understand the value of lifelong learning.",
    "PSO1": "To build a strong foundation in scientific and engineering fundamentals necessary to formulate, solve, and analyze engineering problems for successful careers to meet the global demands of society.",
    "PSO2": "To develop the ability among students to synthesize data and technical concepts of Electronics and Communication for application in core and multidisciplinary projects.",
    "PSO3": "To promote awareness among students for the value of lifelong learning and introduce them to professional ethics and codes of professional practice."
  };

  return NextResponse.json(programOutcomes);
}