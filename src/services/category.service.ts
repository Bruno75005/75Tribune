import { prisma } from '@/lib/prisma';
import slugify from 'slugify';
import { Category, Prisma } from '@prisma/client';

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  id: string;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
  _count?: {
    articles: number;
    children: number;
  };
}

export class CategoryService {
  async findAll(activeOnly = false) {
    const where: Prisma.CategoryWhereInput = activeOnly 
      ? { isActive: true }
      : {};

    return prisma.category.findMany({
      where,
      orderBy: {
        order: 'asc'
      },
      include: {
        parent: true,
        _count: {
          select: {
            articles: true,
            children: true
          }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        _count: {
          select: {
            articles: true,
            children: true
          }
        }
      }
    });
  }

  async findBySlug(slug: string) {
    return prisma.category.findFirst({
      where: { 
        slug,
        isActive: true
      },
      include: {
        parent: true,
        _count: {
          select: {
            articles: true,
            children: true
          }
        }
      }
    });
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    const slug = slugify(data.name, { lower: true, strict: true });
    
    return prisma.category.create({
      data: {
        ...data,
        slug,
      },
      include: {
        parent: true,
        _count: {
          select: {
            articles: true,
            children: true
          }
        }
      }
    });
  }

  async update(data: UpdateCategoryDTO): Promise<Category> {
    const { id, ...updateData } = data;
    const slug = updateData.name ? slugify(updateData.name, { lower: true, strict: true }) : undefined;

    return prisma.category.update({
      where: { id },
      data: {
        ...updateData,
        slug,
      },
      include: {
        parent: true,
        _count: {
          select: {
            articles: true,
            children: true
          }
        }
      }
    });
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
            children: true
          }
        }
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (category._count.articles > 0 || category._count.children > 0) {
      throw new Error('Cannot delete category with articles or subcategories');
    }

    return prisma.category.delete({
      where: { id }
    });
  }

  async reorder(categories: { id: string; order: number }[]) {
    const updates = categories.map(({ id, order }) => 
      prisma.category.update({
        where: { id },
        data: { order }
      })
    );

    return prisma.$transaction(updates);
  }

  async getTree(activeOnly = false): Promise<CategoryTree[]> {
    const where: Prisma.CategoryWhereInput = {
      parent: null,
      ...(activeOnly && { isActive: true })
    };

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        order: 'asc'
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                _count: {
                  select: {
                    articles: true,
                    children: true
                  }
                }
              }
            },
            _count: {
              select: {
                articles: true,
                children: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          },
          ...(activeOnly && {
            where: { isActive: true }
          })
        },
        _count: {
          select: {
            articles: true,
            children: true
          }
        }
      }
    });

    return categories as CategoryTree[];
  }
}
