// app/api/upload/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação — primeira coisa a checar, antes de ler o arquivo
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { dados: null, mensagem: "Não autenticado.", status: false },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { dados: null, mensagem: "Nenhum arquivo enviado.", status: false },
        { status: 400 }
      );
    }

    // 2. Tipo de arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { dados: null, mensagem: "Formato de imagem inválido.", status: false },
        { status: 400 }
      );
    }

    // 3. Tamanho
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { dados: null, mensagem: "Imagem muito grande (máx. 5MB).", status: false },
        { status: 400 }
      );
    }

    // 4. Só chega aqui se passou em tudo — agora sim faz upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: "vitrio",
    });

    return NextResponse.json({
      dados: uploadResult.secure_url,
      mensagem: null,
      status: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { dados: null, mensagem: "Erro ao enviar a imagem.", status: false },
      { status: 500 }
    );
  }
}